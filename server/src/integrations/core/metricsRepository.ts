import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import type { ProviderDbCode } from './providerDbCode.js';

export interface DailyMetricRecord {
  clientIntegrationId: string;
  clientId: string;
  provider: ProviderDbCode;
  externalAccountId: string;
  metricDate: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  leads: number;
  conversions: number;
  conversionValue: number;
  roas: number | null;
  currencyCode: string | null;
  rawMetrics: unknown;
  actorId: string | null;
}

// Upsert por (client_integration_id, metric_date) - roda um sync repetido para o mesmo periodo
// sem duplicar linhas, so atualiza os valores (util para reprocessar um dia que a Meta ainda
// estava consolidando).
export async function upsertDailyMetrics(records: DailyMetricRecord[]): Promise<void> {
  if (records.length === 0) return;

  const payload = records.map((record) => ({
    client_integration_id: record.clientIntegrationId,
    client_id: record.clientId,
    provider: record.provider,
    external_account_id: record.externalAccountId,
    metric_date: record.metricDate,
    spend: record.spend,
    impressions: record.impressions,
    reach: record.reach,
    clicks: record.clicks,
    ctr: record.ctr,
    cpc: record.cpc,
    cpm: record.cpm,
    leads: record.leads,
    conversions: record.conversions,
    conversion_value: record.conversionValue,
    roas: record.roas,
    currency_code: record.currencyCode,
    raw_metrics: record.rawMetrics,
    updated_by: record.actorId,
  }));

  const { error } = await supabaseAdmin
    .from('integration_daily_metrics')
    .upsert(payload, { onConflict: 'client_integration_id,metric_date' });

  if (error) throw error;
}
