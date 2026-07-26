import type { FastifyReply, FastifyRequest } from 'fastify';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthenticatedUser;
  }
}

function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

// Mesma verificacao de JWT ja usada nas Edge Functions do Supabase (auth.getUser via token),
// so que aqui a checagem de papel e feita manualmente contra profiles/roles usando a service role
// (esse servidor nao tem um client "por requisicao" com a chave anon) - por isso replicamos
// explicitamente o filtro status='active' e deleted_at is null que public.current_user_role()
// ja aplica no banco, para manter o mesmo criterio de "usuario admin ativo".
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = extractBearerToken(request);

  if (!token) {
    await reply.status(401).send({ error: 'Missing or invalid Authorization header.' });
    return;
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData?.user) {
    await reply.status(401).send({ error: 'Unauthorized: invalid or expired token.' });
    return;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, status, deleted_at, roles(name)')
    .eq('id', userData.user.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();

  if (profileError || !profile) {
    await reply.status(403).send({ error: 'Forbidden: profile not found or inactive.' });
    return;
  }

  const roleRelation = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
  const role = roleRelation?.name;

  if (role !== 'admin') {
    await reply.status(403).send({ error: 'Forbidden: this endpoint requires an admin user.' });
    return;
  }

  request.authUser = { id: userData.user.id, email: userData.user.email ?? null };
}
