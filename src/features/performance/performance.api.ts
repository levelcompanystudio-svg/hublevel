import { supabase } from '../../lib/supabase';
import { getDefaultPerformancePeriod } from './performance-period';
import type { PerformancePeriodRange } from './performance-period';
import type { PerformanceDailyPoint, PerformanceOverview, PerformanceTotals } from './performance.types';
import { emptyPerformanceOverview } from './performance.types';

interface DailyMetricRow {
  metric_date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  conversion_value: number;
}

const DAILY_METRIC_SELECT = 'metric_date, spend, impressions, reach, clicks, leads, conversions, conversion_value';

// Uma linha por (client_integration, dia) - se um cliente tiver mais de uma conta/provider no
// futuro, ou na visao de carteira (varios clientes), pode haver mais de uma linha para a mesma
// data. Agrupa por data somando os valores antes de montar a serie diaria e os totais.
function groupRowsByDate(rows: DailyMetricRow[]): DailyMetricRow[] {
  const map = new Map<string, DailyMetricRow>();

  for (const row of rows) {
    const existing = map.get(row.metric_date);
    if (existing) {
      existing.spend += row.spend;
      existing.impressions += row.impressions;
      existing.reach += row.reach;
      existing.clicks += row.clicks;
      existing.leads += row.leads;
      existing.conversions += row.conversions;
      existing.conversion_value += row.conversion_value;
    } else {
      map.set(row.metric_date, { ...row });
    }
  }

  return Array.from(map.values());
}

function buildOverview(rawRows: DailyMetricRow[]): PerformanceOverview {
  if (rawRows.length === 0) return emptyPerformanceOverview;

  const rows = groupRowsByDate(rawRows).sort((a, b) => a.metric_date.localeCompare(b.metric_date));

  const dailySeries: PerformanceDailyPoint[] = rows.map((row) => ({
    date: row.metric_date,
    spend: row.spend,
    impressions: row.impressions,
    reach: row.reach,
    clicks: row.clicks,
    leads: row.leads,
    conversions: row.conversions,
    conversionValue: row.conversion_value,
  }));

  const investment = rows.reduce((sum, row) => sum + row.spend, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const reach = rows.reduce((sum, row) => sum + row.reach, 0);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const leads = rows.reduce((sum, row) => sum + row.leads, 0);
  const conversions = rows.reduce((sum, row) => sum + row.conversions, 0);
  const conversionValue = rows.reduce((sum, row) => sum + row.conversion_value, 0);

  const totals: PerformanceTotals = {
    investment,
    impressions,
    reach,
    clicks,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : null,
    cpc: clicks > 0 ? investment / clicks : null,
    cpm: impressions > 0 ? (investment / impressions) * 1000 : null,
    leads,
    cpl: leads > 0 ? investment / leads : null,
    conversions,
    conversionValue,
    roas: investment > 0 && conversionValue > 0 ? conversionValue / investment : null,
  };

  return { totals, dailySeries, hasData: true };
}

// Le public.integration_daily_metrics (gravada pelo servidor /server ao sincronizar Meta Ads -
// nunca pelo frontend, e nunca chamando Meta/Google diretamente daqui). RLS ja restringe gestor
// aos proprios clientes. Nao consulta nenhuma outra tabela para performance.
export async function getClientPerformanceOverview(
  clientId: string,
  period: PerformancePeriodRange = getDefaultPerformancePeriod(),
): Promise<PerformanceOverview> {
  const { data, error } = await supabase
    .from('integration_daily_metrics')
    .select(DAILY_METRIC_SELECT)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .gte('metric_date', period.startDate)
    .lte('metric_date', period.endDate)
    .order('metric_date', { ascending: true });

  if (error) throw error;
  return buildOverview((data ?? []) as DailyMetricRow[]);
}

// Mesma agregacao, mas sem filtrar por cliente - usada em /app/performance e no Dashboard geral.
// RLS ja restringe gestor as linhas dos proprios clientes automaticamente.
export async function getPortfolioPerformanceOverview(
  period: PerformancePeriodRange = getDefaultPerformancePeriod(),
): Promise<PerformanceOverview> {
  const { data, error } = await supabase
    .from('integration_daily_metrics')
    .select(DAILY_METRIC_SELECT)
    .is('deleted_at', null)
    .gte('metric_date', period.startDate)
    .lte('metric_date', period.endDate)
    .order('metric_date', { ascending: true });

  if (error) throw error;
  return buildOverview((data ?? []) as DailyMetricRow[]);
}
