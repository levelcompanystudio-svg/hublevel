import { supabase } from '../../lib/supabase';
import type { ClientHealthStatus, ClientStatus } from '../clients/clients.types';

// Camada de dados do portal externo.
//
// listMyActiveClientMemberships: le somente client_user_memberships, protegido pela RLS
// "external user can read own membership" (migration 031) - profile_id = auth.uid(), sem
// excecao.
//
// listExternalClientSummaries: le public.clients, protegido pela RLS "external user can read own
// linked clients" (migration 033) - so retorna linhas onde public.user_has_client_membership(id)
// e verdadeiro para o usuario logado. Nao ha bypass: se a policy nao existir/nao aplicar, o
// Supabase simplesmente nao devolve nenhuma linha.
//
// Ambas as funcoes filtram explicitamente por profile_id/status/deleted_at mesmo a RLS ja
// restringindo, seguindo o mesmo padrao do resto do app (nunca confiar so na RLS para a forma da
// query).
export interface ExternalClientMembership {
  id: string;
  client_id: string;
  membership_role: string;
  can_view_all_opportunities: boolean;
}

export interface ExternalClientSummary {
  id: string;
  trade_name: string | null;
  company_name: string;
  segment: string | null;
  status: ClientStatus;
  health_status: ClientHealthStatus;
}

export interface ExternalClientLink {
  membership: ExternalClientMembership;
  client: ExternalClientSummary;
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

export async function listExternalClientSummaries(clientIds: string[]): Promise<ExternalClientSummary[]> {
  if (clientIds.length === 0) return [];

  const { data, error } = await supabase
    .from('clients')
    .select('id, trade_name, company_name, segment, status, health_status')
    .in('id', clientIds)
    .is('deleted_at', null);

  if (error) throw new Error(error.message || 'Erro ao carregar os dados dos clientes vinculados.');
  return (data ?? []) as ExternalClientSummary[];
}

// Junta as duas queries acima em um so resultado, pronto para a UI. Se uma membership apontar
// para um client_id que a RLS de clients nao devolveu (linha deletada, por exemplo), essa
// membership e descartada aqui em vez de quebrar a tela com um cliente sem nome.
export async function listMyExternalClientLinks(userId: string): Promise<ExternalClientLink[]> {
  const memberships = await listMyActiveClientMemberships(userId);
  const summaries = await listExternalClientSummaries(memberships.map((membership) => membership.client_id));
  const summaryById = new Map(summaries.map((client) => [client.id, client]));

  const links: ExternalClientLink[] = [];
  for (const membership of memberships) {
    const client = summaryById.get(membership.client_id);
    if (client) links.push({ membership, client });
  }
  return links;
}
