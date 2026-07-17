export type IntegrationProvider = 'meta_ads' | 'google_ads';
export type IntegrationStatus = 'not_connected' | 'pending' | 'connected' | 'error';

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = ['meta_ads', 'google_ads'];

export const integrationLabels: Record<IntegrationProvider, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
};

export const integrationDescriptions: Record<IntegrationProvider, string> = {
  meta_ads: 'Investimento, alcance e resultados de campanhas no Meta (Facebook/Instagram).',
  google_ads: 'Investimento, cliques e conversoes de campanhas no Google Ads.',
};

export const integrationMonograms: Record<IntegrationProvider, string> = {
  meta_ads: 'M',
  google_ads: 'G',
};

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  not_connected: 'Nao conectado',
  pending: 'Pendente',
  connected: 'Conectado',
  error: 'Erro',
};

export interface IntegrationClientRef {
  id: string;
  company_name: string;
  trade_name: string | null;
}

// `id: null` representa uma integracao que ainda nao tem registro em `client_integrations`
// (provedor nunca configurado para este cliente) — a UI trata isso como "Nao conectado" sem
// precisar de um estado especial separado.
export interface ClientIntegration {
  id: string | null;
  client_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  external_account_id: string | null;
  external_account_name: string | null;
  last_sync_at: string | null;
  error_message: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  client?: IntegrationClientRef | IntegrationClientRef[] | null;
}

export function emptyClientIntegration(
  clientId: string,
  provider: IntegrationProvider,
  client?: IntegrationClientRef | null,
): ClientIntegration {
  return {
    id: null,
    client_id: clientId,
    provider,
    status: 'not_connected',
    external_account_id: null,
    external_account_name: null,
    last_sync_at: null,
    error_message: null,
    notes: null,
    created_at: null,
    updated_at: null,
    client: client ?? null,
  };
}
