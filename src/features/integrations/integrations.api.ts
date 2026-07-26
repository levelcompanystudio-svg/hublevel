import { serverGet, serverPost } from '../../lib/serverClient';
import { supabase } from '../../lib/supabase';
import { INTEGRATION_PROVIDERS, emptyClientIntegration } from './integrations.types';
import type { ClientIntegration, IntegrationClientRef, MetaAdAccountOption } from './integrations.types';

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

const clientIntegrationSelect = `
  id,
  client_id,
  provider,
  status,
  external_account_id,
  external_account_name,
  last_sync_at,
  last_success_at,
  last_error_code,
  last_error_at,
  currency_code,
  timezone,
  error_message,
  notes,
  created_at,
  updated_at,
  client:clients!client_integrations_client_id_fkey(id, company_name, trade_name)
`;

// Sem tabela de tokens, sem OAuth e sem chamada a nenhuma API externa: apenas leitura do status
// ja persistido em `client_integrations` (real, mas ainda sem sincronizacao de fato).
export async function listAllClientIntegrations(): Promise<ClientIntegration[]> {
  const { data, error } = await supabase
    .from('client_integrations')
    .select(clientIntegrationSelect)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ClientIntegration[];
}

export async function listClientIntegrationsByClient(clientId: string): Promise<ClientIntegration[]> {
  const { data, error } = await supabase
    .from('client_integrations')
    .select(clientIntegrationSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null);

  if (error) throw error;
  return (data ?? []) as unknown as ClientIntegration[];
}

// Garante exatamente uma entrada por provedor permitido (Meta Ads / Google Ads) para um cliente,
// preenchendo com o estado "nao conectado" quando nao existe registro real ainda.
export function mergeIntegrationsForClient(
  clientId: string,
  realRows: ClientIntegration[],
  client?: IntegrationClientRef | null,
): ClientIntegration[] {
  return INTEGRATION_PROVIDERS.map((provider) => {
    const existing = realRows.find((row) => row.provider === provider);
    return existing ?? emptyClientIntegration(clientId, provider, client);
  });
}

// Mesma logica, mas para a visao global: cada cliente aparece com uma linha por provedor,
// mesclando registros reais com o estado "nao conectado" para o que nunca foi criado.
export function mergeIntegrationsForClients(
  clients: Array<{ id: string; company_name: string; trade_name: string | null }>,
  realRows: ClientIntegration[],
): ClientIntegration[] {
  const rowsByClient = new Map<string, ClientIntegration[]>();
  for (const row of realRows) {
    const list = rowsByClient.get(row.client_id) ?? [];
    list.push(row);
    rowsByClient.set(row.client_id, list);
  }

  return clients.flatMap((client) =>
    mergeIntegrationsForClient(client.id, rowsByClient.get(client.id) ?? [], {
      id: client.id,
      company_name: client.company_name,
      trade_name: client.trade_name,
    }),
  );
}

export function integrationClientRef(integration: ClientIntegration): IntegrationClientRef | null {
  return firstRelation(integration.client);
}

// A partir daqui, chamadas ao backend /server (nunca diretamente a Meta/Google a partir do
// frontend). O servidor e quem detem o system user token e fala com a Graph API; aqui so
// anexamos o JWT da sessao Supabase do usuario logado.

export async function listAvailableMetaAdAccounts(): Promise<MetaAdAccountOption[]> {
  const result = await serverGet<{ accounts: MetaAdAccountOption[] }>('/integrations/meta/accounts');
  return result.accounts;
}

export async function createMetaConnection(clientId: string, adAccountId: string): Promise<ClientIntegration> {
  const result = await serverPost<{ connection: ClientIntegration }>('/integrations/meta/connections', {
    client_id: clientId,
    ad_account_id: adAccountId,
  });
  return result.connection;
}

export async function syncClientIntegration(connectionId: string): Promise<void> {
  await serverPost<{ ok: true }>(`/integrations/connections/${connectionId}/sync`);
}
