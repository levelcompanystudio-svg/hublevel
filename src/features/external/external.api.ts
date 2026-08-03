import { supabase } from '../../lib/supabase';

// Camada de dados do portal externo. So le client_user_memberships (RLS da migration 031: "external
// user can read own membership" - profile_id = auth.uid(), sem excecao). Nao consulta
// public.clients: nao existe policy de SELECT para usuario externo nessa tabela hoje (ver nota em
// ExternalClientPortal.tsx), entao nao ha nome de cliente real disponivel sem uma policy nova - o
// que esta fora do escopo desta etapa (nao alterar RLS). Filtra explicitamente por profile_id/
// status/deleted_at mesmo a RLS ja restringindo, seguindo o mesmo padrao do resto do app (nunca
// confiar so na RLS para a forma da query).
export interface ExternalClientMembership {
  id: string;
  client_id: string;
  membership_role: string;
  can_view_all_opportunities: boolean;
}

export async function listMyActiveClientMemberships(userId: string): Promise<ExternalClientMembership[]> {
  const { data, error } = await supabase
    .from('client_user_memberships')
    .select('id, client_id, membership_role, can_view_all_opportunities')
    .eq('profile_id', userId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message || 'Erro ao carregar seus clientes vinculados.');
  return (data ?? []) as ExternalClientMembership[];
}
