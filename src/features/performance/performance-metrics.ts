// Fonte unica das formulas de metricas derivadas de performance (Etapa B). Antes desta etapa, a
// mesma conta de CTR/CPC/CPM/CPL/ROAS existia duplicada em performance.api.ts (buildOverview) e
// em PerformanceOverviewPage.tsx (CPL por linha da tabela diaria). Qualquer componente/query que
// precise de uma dessas razoes deve chamar os helpers daqui, nunca reescrever a conta.
//
// Regra unica: denominador 0 (ou negativo/invalido) sempre retorna null - nunca 0, nunca
// Infinity/NaN. null significa "sem base de calculo no periodo", nao "resultado zero real". Os
// valores retornados sao numeros puros (sem formatacao de moeda/percentual) - isso e
// responsabilidade exclusiva dos componentes de UI.

export function calculateCtr(clicks: number, impressions: number): number | null {
  return impressions > 0 ? (clicks / impressions) * 100 : null;
}

export function calculateCpc(spend: number, clicks: number): number | null {
  return clicks > 0 ? spend / clicks : null;
}

export function calculateCpm(spend: number, impressions: number): number | null {
  return impressions > 0 ? (spend / impressions) * 1000 : null;
}

export function calculateCpl(spend: number, leads: number): number | null {
  return leads > 0 ? spend / leads : null;
}

export function calculateRoas(conversionValue: number, spend: number): number | null {
  return spend > 0 ? conversionValue / spend : null;
}
