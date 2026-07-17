// HubLevel Edge Function: create-app-user
//
// Cria usuarios no Supabase Auth a partir da tela administrativa do HubLevel.
// A funcao exige JWT de usuario logado e valida que o chamador e Admin antes
// de usar auth.admin.createUser. O profile nasce automaticamente pelo trigger
// public.handle_new_auth_user(), com papel padrao "colaborador".

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface RequestBody {
  name?: string;
  email?: string;
  password?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return json({ error: 'Supabase environment not configured for this function.' }, 500);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const { data: requesterProfile, error: requesterProfileError } = await userClient
      .from('profiles')
      .select('id, roles(name)')
      .eq('id', user.id)
      .maybeSingle();

    if (requesterProfileError || !requesterProfile) {
      return json({ error: 'Profile not found.' }, 403);
    }

    const roleRelation = Array.isArray(requesterProfile.roles) ? requesterProfile.roles[0] : requesterProfile.roles;
    if (roleRelation?.name !== 'admin') {
      return json({ error: 'Forbidden: only admins can create users.' }, 403);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';

    if (!name || !email || password.length < 6) {
      return json({ error: 'Informe nome, e-mail e senha temporaria com pelo menos 6 caracteres.' }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError || !created.user) {
      return json({ error: createError?.message ?? 'Erro ao criar usuario.' }, 400);
    }

    const profile = await findProfile(adminClient, created.user.id);
    if (!profile) {
      return json({ error: 'Usuario criado, mas o profile ainda nao ficou disponivel. Atualize a tela em alguns segundos.' }, 202);
    }

    return json({ profile }, 201);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});

async function findProfile(adminClient: ReturnType<typeof createClient>, userId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, role_id, name, email, status, created_at, roles(name)')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) return data;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}
