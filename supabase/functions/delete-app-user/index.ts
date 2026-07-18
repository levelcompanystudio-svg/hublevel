// HubLevel Edge Function: delete-app-user
//
// Remove o acesso de um usuario e faz soft delete do profile no HubLevel.
// A funcao exige JWT de usuario logado e valida que o chamador e Admin antes de usar
// auth.admin.updateUserById. Nao apaga o Auth user porque o profile e referenciado
// pelo historico operacional do sistema.

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
  profile_id?: string;
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
    if (roleRelation?.name !== 'admin') {
      return json({ error: 'Forbidden: only admins can delete users.' }, 403);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const profileId = body.profile_id;
    if (!profileId) return json({ error: 'profile_id is required.' }, 400);
    if (profileId === user.id) return json({ error: 'Voce nao pode excluir sua propria conta.' }, 400);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: targetProfile, error: targetError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .is('deleted_at', null)
      .maybeSingle();

    if (targetError) return json({ error: targetError.message }, 500);
    if (!targetProfile) return json({ error: 'Usuario nao encontrado.' }, 404);

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        status: 'inactive',
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', profileId);

    if (profileError) return json({ error: profileError.message }, 500);

    const { error: authError } = await adminClient.auth.admin.updateUserById(profileId, {
      ban_duration: '876000h',
    });

    if (authError) return json({ error: authError.message }, 500);

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});
