import type { MetaInsightAction, MetaInsightRow } from './metaApiClient.js';

export interface NormalizedDailyMetric {
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
  rawMetrics: MetaInsightRow;
}

// Meta tem dezenas de action_type possiveis (uma para cada tipo de evento configurado no pixel/
// conjunto de anuncios). Este e um conjunto inicial e documentado dos tipos mais comuns para
// "lead" e "compra/conversao de valor" - pode ser expandido em blocos futuros sem quebrar o
// formato ja gravado (raw_metrics sempre preserva a resposta original da Meta por completo).
const LEAD_ACTION_TYPES = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'];
const CONVERSION_ACTION_TYPES = ['purchase', 'offsite_conversion.fb_pixel_purchase', 'onsite_conversion.purchase'];

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseNullableNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sumActions(actions: MetaInsightAction[] | undefined, types: string[]): number {
  if (!actions) return 0;
  return actions
    .filter((action) => types.includes(action.action_type))
    .reduce((sum, action) => sum + parseNumber(action.value), 0);
}

export function normalizeMetaDailyInsight(row: MetaInsightRow): NormalizedDailyMetric {
  const spend = parseNumber(row.spend);
  const leads = sumActions(row.actions, LEAD_ACTION_TYPES);
  const conversions = sumActions(row.actions, CONVERSION_ACTION_TYPES);
  const conversionValue = sumActions(row.action_values, CONVERSION_ACTION_TYPES);

  const reportedRoas = row.purchase_roas?.[0]?.value ? parseNullableNumber(row.purchase_roas[0].value) : null;
  const derivedRoas = spend > 0 && conversionValue > 0 ? conversionValue / spend : null;

  return {
    metricDate: row.date_start,
    spend,
    impressions: parseNumber(row.impressions),
    reach: parseNumber(row.reach),
    clicks: parseNumber(row.clicks),
    ctr: parseNullableNumber(row.ctr),
    cpc: parseNullableNumber(row.cpc),
    cpm: parseNullableNumber(row.cpm),
    leads,
    conversions,
    conversionValue,
    roas: reportedRoas ?? derivedRoas,
    rawMetrics: row,
  };
}
