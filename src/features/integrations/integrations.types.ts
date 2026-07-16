export type IntegrationProvider = 'meta_ads' | 'google_ads' | 'crm_leads' | 'whatsapp';
export type IntegrationStatus = 'nao_conectado' | 'conectado' | 'erro';

export interface IntegrationInfo {
  provider: IntegrationProvider;
  status: IntegrationStatus;
}

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = ['meta_ads', 'google_ads', 'crm_leads', 'whatsapp'];

export const integrationLabels: Record<IntegrationProvider, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  crm_leads: 'CRM / Leads',
  whatsapp: 'WhatsApp',
};

export const integrationDescriptions: Record<IntegrationProvider, string> = {
  meta_ads: 'Investimento, alcance e resultados de campanhas no Meta (Facebook/Instagram).',
  google_ads: 'Investimento, cliques e conversoes de campanhas no Google Ads.',
  crm_leads: 'Sincronizacao de leads e funil comercial com um CRM externo.',
  whatsapp: 'Historico de conversas e status de atendimento via WhatsApp Business.',
};

export const integrationMonograms: Record<IntegrationProvider, string> = {
  meta_ads: 'M',
  google_ads: 'G',
  crm_leads: 'CR',
  whatsapp: 'W',
};
