// HubLevel Edge Function: create-external-client-user
//
// Cria um usuario externo (profile_type='external') a partir da secao "Acesso do cliente" na
// aba CRM, ja vinculado a um cliente via client_user_memberships. Exige JWT de usuario logado e
// valida que o chamador e Admin (qualquer cliente) ou Gestor (somente clientes onde
// clients.responsible_user_id = chamador). O profile nasce pelo trigger existente
// public.handle_new_auth_user() (papel "colaborador", profile_type='internal' por padrao); esta
// funcao entao promove o profile para profile_type='external' e cria a membership, sempre com a
// service role key (nunca exposta ao frontend).

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

const ALLOWED_MEMBERSHIP_ROLES = ['client_viewer', 'client_sales', 'client_admin'];

interface RequestBody {
  name?: string;
  email?: string;
  password?: string;
  client_id?: string;
  membership_role?: string;
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
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

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

    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const { data: requesterProfile, error: requesterProfileError } = await userClient
      .from('profiles')
      .select('id, roles(name)')
      .eq('id', user.id)
      .maybeSingle();

    if (requesterProfileError || !requesterProfile) {
      return json({ error: 'Profile not found.' }, 403);
    }

    const roleRelation = Array.isArray(requesterProfile.roles) ? requesterProfile.roles[0] : requesterProfile.roles;
    const requesterRole = roleRelation?.name;
    if (requesterRole !== 'admin' && requesterRole !== 'gestor') {
      return json({ error: 'Forbidden: only admins or gestores can create external users.' }, 403);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? '';
    const clientId = body.client_id;
    const membershipRole = body.membership_role;

    if (!name || !email || password.length < 6) {
      return json({ error: 'Informe nome, e-mail e senha temporaria com pelo menos 6 caracteres.' }, 400);
    }
    if (!clientId) return json({ error: 'client_id is required.' }, 400);
    if (!membershipRole || !ALLOWED_MEMBERSHIP_ROLES.includes(membershipRole)) {
      return json({ error: 'Papel invalido para vinculo externo.' }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${serviceRoleKey}` } },
    });

    const { data: client, error: clientError } = await adminClient
      .from('clients')
      .select('id, responsible_user_id')
      .eq('id', clientId)
      .is('deleted_at', null)
      .maybeSingle();

    if (clientError) return json({ error: clientError.message }, 500);
    if (!client) return json({ error: 'Cliente nao encontrado.' }, 404);

    if (requesterRole === 'gestor' && client.responsible_user_id !== user.id) {
      return json({ error: 'Forbidden: gestor so pode gerenciar acesso de clientes sob sua responsabilidade.' }, 403);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError || !created.user) {
      return json({ error: createError?.message ?? 'Erro ao criar usuario.' }, 400);
    }

    const profile = await waitForProfile(adminClient, created.user.id);
    if (!profile) {
      return json({ error: 'Usuario criado, mas o profile ainda nao ficou disponivel. Tente vincular em alguns segundos.' }, 202);
    }

    const { error: promoteError } = await adminClient
      .from('profiles')
      .update({ profile_type: 'external' })
      .eq('id', created.user.id);

    if (promoteError) return json({ error: promoteError.message }, 500);

    const { data: membership, error: membershipError } = await adminClient
      .from('client_user_memberships')
      .insert({
        client_id: clientId,
        profile_id: created.user.id,
        membership_role: membershipRole,
        status: 'active',
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id, client_id, profile_id, membership_role, status, can_view_all_opportunities, created_at')
      .single();

    if (membershipError) return json({ error: membershipError.message }, 500);

    return json({ profile: { ...profile, profile_type: 'external' }, membership }, 201);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});

async function waitForProfile(adminClient: ReturnType<typeof createClient>, userId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, name, email, status, profile_type')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) return data;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}
