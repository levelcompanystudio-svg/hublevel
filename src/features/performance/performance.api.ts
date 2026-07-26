import { supabase } from '../../lib/supabase';
import type { ClientPerformanceMetrics } from './performance.types';
import { emptyClientPerformanceMetrics } from './performance.types';

const LOOKBACK_DAYS = 30;

function daysAgoDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

interface DailyMetricRow {
  spend: number;
  leads: number;
  clicks: number;
  conversion_value: number;
}

function aggregateMetrics(rows: DailyMetricRow[]): ClientPerformanceMetrics {
  if (rows.length === 0) return emptyClientPerformanceMetrics;

  const investment = rows.reduce((sum, row) => sum + row.spend, 0);
  const leads = rows.reduce((sum, row) => sum + row.leads, 0);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const conversionValue = rows.reduce((sum, row) => sum + row.conversion_value, 0);

  return {
    investment,
    leads,
    cpl: leads > 0 ? investment / leads : null,
    roas: investment > 0 && conversionValue > 0 ? conversionValue / investment : null,
    clicks,
    nps: null,
  };
}

// Le public.integration_daily_metrics (gravada pelo servidor /server ao sincronizar Meta Ads -
// nunca pelo frontend, e nunca chamando Meta/Google diretamente daqui). RLS ja restringe gestor
// aos proprios clientes; NPS continua sem fonte de dado real, entao permanece sempre null - sem
// inventar numero.
export async function getClientPerformanceMetrics(clientId: string): Promise<ClientPerformanceMetrics> {
  const { data, error } = await supabase
    .from('integration_daily_metrics')
    .select('spend, leads, clicks, conversion_value')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .gte('metric_date', daysAgoDateOnly(LOOKBACK_DAYS));

  if (error) throw error;
  return aggregateMetrics((data ?? []) as DailyMetricRow[]);
}

// Mesma agregacao, mas sem filtrar por cliente - usada em /app/performance (visao de carteira).
// RLS ja restringe gestor as linhas dos proprios clientes automaticamente.
export async function getPortfolioPerformanceMetrics(): Promise<ClientPerformanceMetrics> {
  const { data, error } = await supabase
    .from('integration_daily_metrics')
    .select('spend, leads, clicks, conversion_value')
    .is('deleted_at', null)
    .gte('metric_date', daysAgoDateOnly(LOOKBACK_DAYS));

  if (error) throw error;
  return aggregateMetrics((data ?? []) as DailyMetricRow[]);
}
