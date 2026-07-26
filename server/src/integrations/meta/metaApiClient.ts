import { createHmac } from 'node:crypto';
import { env } from '../../env.js';

const GRAPH_BASE_URL = `https://graph.facebook.com/${env.META_API_VERSION}`;

export class MetaApiError extends Error {
  code: string | number | undefined;
  type: string | undefined;

  constructor(message: string, code?: string | number, type?: string) {
    super(message);
    this.name = 'MetaApiError';
    this.code = code;
    this.type = type;
  }
}

interface MetaGraphErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
}

// appsecret_proof e uma recomendacao de seguranca da Graph API (HMAC-SHA256 do access token
// usando o app secret) - se META_APP_SECRET nao estiver configurado, simplesmente nao enviamos
// esse parametro e a chamada continua funcionando normalmente.
function buildAppSecretProof(accessToken: string): string | null {
  if (!env.META_APP_SECRET) return null;
  return createHmac('sha256', env.META_APP_SECRET).update(accessToken).digest('hex');
}

async function metaFetch<T>(path: string, searchParams: Record<string, string> = {}): Promise<T> {
  const accessToken = env.META_SYSTEM_USER_TOKEN;
  const url = new URL(`${GRAPH_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('access_token', accessToken);

  const appSecretProof = buildAppSecretProof(accessToken);
  if (appSecretProof) url.searchParams.set('appsecret_proof', appSecretProof);

  const response = await fetch(url, { method: 'GET' });
  const body = (await response.json().catch(() => ({}))) as T & MetaGraphErrorBody;

  if (!response.ok || body?.error) {
    throw new MetaApiError(
      body?.error?.message ?? `Meta Graph API request failed with status ${response.status}.`,
      body?.error?.code,
      body?.error?.type,
    );
  }

  return body;
}

export interface MetaAdAccountRow {
  id: string; // vem no formato "act_<numero>"
  account_id: string;
  name: string;
  currency: string;
  timezone_name: string;
}

export async function listMetaAdAccounts(): Promise<MetaAdAccountRow[]> {
  const result = await metaFetch<{ data: MetaAdAccountRow[] }>('/me/adaccounts', {
    fields: 'id,account_id,name,currency,timezone_name',
  });
  return result.data ?? [];
}

export interface MetaInsightAction {
  action_type: string;
  value: string;
}

export interface MetaInsightRow {
  date_start: string;
  date_stop: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: MetaInsightAction[];
  action_values?: MetaInsightAction[];
  purchase_roas?: MetaInsightAction[];
}

// time_increment=1 retorna uma linha por dia dentro do range - e o que precisamos para gravar
// metricas diarias normalizadas (uma linha por dia em integration_daily_metrics).
export async function fetchMetaDailyInsights(adAccountId: string, since: string, until: string): Promise<MetaInsightRow[]> {
  const accountPath = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

  const result = await metaFetch<{ data: MetaInsightRow[] }>(`/${accountPath}/insights`, {
    fields: 'spend,impressions,reach,clicks,ctr,cpc,cpm,actions,action_values,purchase_roas',
    time_range: JSON.stringify({ since, until }),
    time_increment: '1',
    level: 'account',
  });

  return result.data ?? [];
}
