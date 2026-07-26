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
