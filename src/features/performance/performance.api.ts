import { supabase } from '../../lib/supabase';
import { calculateCpc, calculateCpl, calculateCpm, calculateCtr, calculateRoas } from './performance-metrics';
import { getDefaultPerformancePeriod } from './performance-period';
import type { PerformancePeriodRange } from './performance-period';
import type {
  ClientPerformanceSummary,
  PerformanceDailyPoint,
  PerformanceIntegrationStatus,
  PerformanceOverview,
  PerformanceProvider,
  PerformanceTotals,
  PortfolioPerformanceOverview,
} from './performance.types';
import { PERFORMANCE_INTEGRATION_STATUS_LABELS, emptyPerformanceOverview } from './performance.types';

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

interface DailyMetricRowWithClient extends DailyMetricRow {
  client_id: string;
}

interface ClientIntegrationRow {
  client_id: string;
  provider: PerformanceProvider;
  status: 'not_connected' | 'pending' | 'connected' | 'error';
  external_account_name: string | null;
  last_sync_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  error_message: string | null;
}

interface ClientRow {
  id: string;
  trade_name: string | null;
  company_name: string;
}

const DAILY_METRIC_SELECT = 'metric_date, spend, impressions, reach, clicks, leads, conversions, conversion_value';
const INTEGRATION_SELECT = 'client_id, provider, status, external_account_name, last_sync_at, last_success_at, last_error_at, error_message';

// Uma linha por (client_integration, dia) - se um cliente tiver mais de uma conta/provider no
// futuro, ou na visao de carteira (varios clientes), pode haver mais de uma linha para a mesma
// data. Agrupa por data somando os valores antes de montar a serie diaria e os totais.
function groupRowsByDate<T extends DailyMetricRow>(rows: T[]): DailyMetricRow[] {
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
      map.set(row.metric_date, {
        metric_date: row.metric_date,
        spend: row.spend,
        impressions: row.impressions,
        reach: row.reach,
        clicks: row.clicks,
        leads: row.leads,
        conversions: row.conversions,
        conversion_value: row.conversion_value,
      });
    }
  }

  return Array.from(map.values());
}

// Base de calculo compartilhada por getClientPerformanceOverview e getPortfolioPerformanceOverview
// - unico lugar que soma linhas brutas em totals/dailySeries, usando os helpers de
// performance-metrics.ts para as razoes derivadas (ctr/cpc/cpm/cpl/roas). Nao formata nada -
// devolve numeros puros.
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
    ctr: calculateCtr(clicks, impressions),
    cpc: calculateCpc(investment, clicks),
    cpm: calculateCpm(investment, impressions),
    leads,
    cpl: calculateCpl(investment, leads),
    conversions,
    conversionValue,
    roas: calculateRoas(conversionValue, investment),
  };

  return { totals, dailySeries, hasData: true };
}

// Prioridade quando um cliente tem mais de uma linha em client_integrations (um provider hoje,
// mas o schema ja permite Meta + Google no mesmo cliente): erro chama mais atencao que
// pendente/conectado, entao vence a escolha de qual integracao representa o cliente no resumo.
const STATUS_PRIORITY: Record<ClientIntegrationRow['status'], number> = {
  error: 3,
  connected: 2,
  pending: 1,
  not_connected: 0,
};

function pickPrimaryIntegration(integrations: ClientIntegrationRow[]): ClientIntegrationRow | null {
  if (integrations.length === 0) return null;
  return integrations.reduce((best, current) =>
    STATUS_PRIORITY[current.status] > STATUS_PRIORITY[best.status] ? current : best,
  );
}

function resolveIntegrationStatus(
  integration: ClientIntegrationRow | null,
  rowsCount: number,
): PerformanceIntegrationStatus {
  if (!integration || integration.status === 'not_connected') return 'not_connected';
  if (integration.status === 'error') return 'error';
  if (integration.status === 'pending') return 'pending';
  return rowsCount > 0 ? 'connected_with_data' : 'connected_without_data';
}

// Unico lugar que cruza integration_daily_metrics com client_integrations para montar o resumo de
// UM cliente - usado tanto por getClientPerformanceOverview (1 cliente) quanto por
// getPortfolioPerformanceOverview (N clientes, chamado uma vez por cliente da carteira).
function buildClientPerformanceSummary(
  client: ClientRow,
  integrations: ClientIntegrationRow[],
  metricRows: DailyMetricRow[],
  period: PerformancePeriodRange,
): ClientPerformanceSummary {
  const overview = buildOverview(metricRows);
  const primaryIntegration = pickPrimaryIntegration(integrations);
  const integrationStatus = resolveIntegrationStatus(primaryIntegration, metricRows.length);

  return {
    ...overview,
    clientId: client.id,
    clientName: client.trade_name || client.company_name,
    provider: primaryIntegration ? primaryIntegration.provider : null,
    integrationStatus,
    integrationStatusLabel: PERFORMANCE_INTEGRATION_STATUS_LABELS[integrationStatus],
    externalAccountName: primaryIntegration?.external_account_name ?? null,
    lastSyncAt: primaryIntegration?.last_sync_at ?? null,
    lastSuccessAt: primaryIntegration?.last_success_at ?? null,
    lastErrorAt: primaryIntegration?.last_error_at ?? null,
    errorMessage: primaryIntegration?.error_message ?? null,
    dateFrom: period.startDate,
    dateTo: period.endDate,
    rowsCount: metricRows.length,
  };
}

// Le public.integration_daily_metrics + public.client_integrations + public.clients (nome do
// cliente) - gravadas pelo servidor /server ao sincronizar Meta Ads (nunca pelo frontend, e nunca
// chamando Meta/Google diretamente daqui). RLS ja restringe gestor aos proprios clientes em todas
// as 3 tabelas. Nao consulta nenhuma outra tabela para performance.
export async function getClientPerformanceOverview(
  clientId: string,
  period: PerformancePeriodRange = getDefaultPerformancePeriod(),
): Promise<ClientPerformanceSummary> {
  const [clientResult, integrationsResult, metricsResult] = await Promise.all([
    supabase.from('clients').select('id, trade_name, company_name').eq('id', clientId).maybeSingle(),
    supabase.from('client_integrations').select(INTEGRATION_SELECT).eq('client_id', clientId).is('deleted_at', null),
    supabase
      .from('integration_daily_metrics')
      .select(DAILY_METRIC_SELECT)
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .gte('metric_date', period.startDate)
      .lte('metric_date', period.endDate)
      .order('metric_date', { ascending: true }),
  ]);

  if (clientResult.error) throw clientResult.error;
  if (integrationsResult.error) throw integrationsResult.error;
  if (metricsResult.error) throw metricsResult.error;

  const client: ClientRow = clientResult.data ?? { id: clientId, trade_name: null, company_name: '' };
  const integrations = (integrationsResult.data ?? []) as ClientIntegrationRow[];
  const metricRows = (metricsResult.data ?? []) as DailyMetricRow[];

  return buildClientPerformanceSummary(client, integrations, metricRows, period);
}

// Visao de carteira: cruza as mesmas 3 tabelas, mas para todos os clientes operacionais (ativo/
// onboarding) visiveis pela RLS do usuario logado. totals/dailySeries globais continuam somando
// TODAS as linhas de integration_daily_metrics do periodo (mesmo comportamento de antes desta
// etapa, sem filtrar por status do cliente) - so o breakdown por cliente (clients[]) e restrito a
// clientes operacionais, para nao misturar clientes encerrados/pausados na lista de atencao.
export async function getPortfolioPerformanceOverview(
  period: PerformancePeriodRange = getDefaultPerformancePeriod(),
): Promise<PortfolioPerformanceOverview> {
  const [clientsResult, integrationsResult, metricsResult] = await Promise.all([
    supabase.from('clients').select('id, trade_name, company_name').is('deleted_at', null).in('status', ['ativo', 'onboarding']),
    supabase.from('client_integrations').select(INTEGRATION_SELECT).is('deleted_at', null),
    supabase
      .from('integration_daily_metrics')
      .select(`${DAILY_METRIC_SELECT}, client_id`)
      .is('deleted_at', null)
      .gte('metric_date', period.startDate)
      .lte('metric_date', period.endDate)
      .order('metric_date', { ascending: true }),
  ]);

  if (clientsResult.error) throw clientsResult.error;
  if (integrationsResult.error) throw integrationsResult.error;
  if (metricsResult.error) throw metricsResult.error;

  const clients = (clientsResult.data ?? []) as ClientRow[];
  const integrations = (integrationsResult.data ?? []) as ClientIntegrationRow[];
  const metricRows = (metricsResult.data ?? []) as DailyMetricRowWithClient[];

  const integrationsByClient = new Map<string, ClientIntegrationRow[]>();
  for (const integration of integrations) {
    const list = integrationsByClient.get(integration.client_id) ?? [];
    list.push(integration);
    integrationsByClient.set(integration.client_id, list);
  }

  const metricsByClient = new Map<string, DailyMetricRow[]>();
  for (const row of metricRows) {
    const list = metricsByClient.get(row.client_id) ?? [];
    list.push(row);
    metricsByClient.set(row.client_id, list);
  }

  const clientSummaries = clients.map((client) =>
    buildClientPerformanceSummary(
      client,
      integrationsByClient.get(client.id) ?? [],
      metricsByClient.get(client.id) ?? [],
      period,
    ),
  );

  const counters = {
    connectedClientsCount: 0,
    connectedWithDataCount: 0,
    connectedWithoutDataCount: 0,
    errorCount: 0,
    pendingCount: 0,
    notConnectedCount: 0,
  };

  for (const summary of clientSummaries) {
    if (summary.integrationStatus === 'connected_with_data') {
      counters.connectedClientsCount += 1;
      counters.connectedWithDataCount += 1;
    } else if (summary.integrationStatus === 'connected_without_data') {
      counters.connectedClientsCount += 1;
      counters.connectedWithoutDataCount += 1;
    } else if (summary.integrationStatus === 'error') {
      counters.errorCount += 1;
    } else if (summary.integrationStatus === 'pending') {
      counters.pendingCount += 1;
    } else {
      counters.notConnectedCount += 1;
    }
  }

  const overview = buildOverview(metricRows);

  return {
    ...overview,
    period,
    clients: clientSummaries,
    ...counters,
  };
}
