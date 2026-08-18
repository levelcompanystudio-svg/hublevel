import type { PerformancePeriodRange } from './performance-period';

export interface PerformanceTotals {
  investment: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  leads: number;
  cpl: number | null;
  conversions: number;
  conversionValue: number;
  roas: number | null;
}

export interface PerformanceDailyPoint {
  date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  conversionValue: number;
}

// hasData=false significa "nenhuma linha sincronizada no periodo" - a UI deve mostrar "Sem dados",
// nunca zero. Quando hasData=true, os campos aditivos de PerformanceTotals (investment,
// impressions, reach, clicks, leads, conversions, conversionValue) sao sempre numeros reais
// (podem ser 0 de verdade, se houve sincronizacao mas sem atividade). Os campos derivados (ctr,
// cpc, cpm, cpl, roas) podem ser null mesmo com hasData=true, quando o denominador e zero
// (ex.: cpl é null se leads=0, mesmo que investment>0).
export interface PerformanceOverview {
  totals: PerformanceTotals;
  dailySeries: PerformanceDailyPoint[];
  hasData: boolean;
}

export const emptyPerformanceTotals: PerformanceTotals = {
  investment: 0,
  impressions: 0,
  reach: 0,
  clicks: 0,
  ctr: null,
  cpc: null,
  cpm: null,
  leads: 0,
  cpl: null,
  conversions: 0,
  conversionValue: 0,
  roas: null,
};

export const emptyPerformanceOverview: PerformanceOverview = {
  totals: emptyPerformanceTotals,
  dailySeries: [],
  hasData: false,
};

// --- Etapa B: cruzamento com o estado real da integracao (client_integrations) ------------------
// Todo o vocabulario abaixo e so de LEITURA/apresentacao - nao introduz nenhuma regra de negocio
// nova nem grava nada. O calculo de integrationStatus fica centralizado em performance.api.ts
// (buildClientPerformanceSummary), nunca duplicado em componente.

export type PerformanceProvider = 'meta_ads' | 'google_ads';

// not_connected: cliente sem nenhuma linha em client_integrations (ou so linhas com
//   status='not_connected', que na pratica nunca deveriam existir de verdade hoje).
// pending: existe uma integracao com status='pending' (fluxo de conexao ainda nao concluido).
// error: existe uma integracao com status='error' (ultimo sync falhou) - prioridade mais alta,
//   sempre mostrado antes de connected_with_data/connected_without_data se coexistirem.
// connected_with_data: integracao status='connected' e ha ao menos 1 linha de
//   integration_daily_metrics no periodo consultado.
// connected_without_data: integracao status='connected' mas 0 linhas no periodo (ver Etapa A:
//   sync "success" com 0 linhas gravadas e um caso real, nao hipotetico).
export type PerformanceIntegrationStatus =
  | 'not_connected'
  | 'pending'
  | 'connected_with_data'
  | 'connected_without_data'
  | 'error';

export const PERFORMANCE_INTEGRATION_STATUS_LABELS: Record<PerformanceIntegrationStatus, string> = {
  not_connected: 'Sem integração',
  pending: 'Pendente',
  connected_with_data: 'Conectado com dados',
  connected_without_data: 'Conectado sem dados',
  error: 'Erro na sincronização',
};

// Resumo de performance de UM cliente, ja cruzado com o status da integracao. Estende
// PerformanceOverview (totals/dailySeries/hasData) de proposito: qualquer consumidor que so
// precisava desses 3 campos (ClientMetricsTab, ClientPerformanceRecent) continua compilando e
// funcionando sem nenhuma mudanca de logica, porque um ClientPerformanceSummary e estruturalmente
// um PerformanceOverview + campos extras.
export interface ClientPerformanceSummary extends PerformanceOverview {
  clientId: string;
  clientName: string;
  provider: PerformanceProvider | null;
  integrationStatus: PerformanceIntegrationStatus;
  integrationStatusLabel: string;
  externalAccountName: string | null;
  lastSyncAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  errorMessage: string | null;
  dateFrom: string;
  dateTo: string;
  rowsCount: number;
}

export function buildEmptyClientPerformanceSummary(clientId: string, clientName: string): ClientPerformanceSummary {
  return {
    ...emptyPerformanceOverview,
    clientId,
    clientName,
    provider: null,
    integrationStatus: 'not_connected',
    integrationStatusLabel: PERFORMANCE_INTEGRATION_STATUS_LABELS.not_connected,
    externalAccountName: null,
    lastSyncAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    errorMessage: null,
    dateFrom: '',
    dateTo: '',
    rowsCount: 0,
  };
}

// Visao de carteira (portfolio) - mesma ideia: estende PerformanceOverview para que
// PerformanceOverviewPage/ResultsDashboard, que so liam totals/dailySeries/hasData, continuem
// compilando sem alteracao de logica. clients traz o breakdown por cliente (mesmo
// ClientPerformanceSummary usado individualmente), e os contadores resumem esse breakdown.
export interface PortfolioPerformanceOverview extends PerformanceOverview {
  period: PerformancePeriodRange;
  clients: ClientPerformanceSummary[];
  connectedClientsCount: number;
  connectedWithDataCount: number;
  connectedWithoutDataCount: number;
  errorCount: number;
  pendingCount: number;
  notConnectedCount: number;
}

export function buildEmptyPortfolioPerformanceOverview(period: PerformancePeriodRange): PortfolioPerformanceOverview {
  return {
    ...emptyPerformanceOverview,
    period,
    clients: [],
    connectedClientsCount: 0,
    connectedWithDataCount: 0,
    connectedWithoutDataCount: 0,
    errorCount: 0,
    pendingCount: 0,
    notConnectedCount: 0,
  };
}
