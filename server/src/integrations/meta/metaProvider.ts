import { toDbProviderCode } from '../core/providerDbCode.js';
import { upsertDailyMetrics } from '../core/metricsRepository.js';
import type {
  AdsProvider,
  AdsProviderCredentials,
  ConnectionStatus,
  DailyMetric,
  DateRange,
  ProviderAccountRef,
} from '../core/types.js';
import { ProviderNotImplementedError } from '../core/types.js';
import { fetchMetaDailyInsights, listMetaAdAccounts, MetaApiError } from './metaApiClient.js';
import { normalizeMetaDailyInsight } from './normalizer.js';

const PROVIDER_NAME = 'meta' as const;
const DEFAULT_SYNC_LOOKBACK_DAYS = 30;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIsoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

// Bloco 2: validateConnection/listAccounts/fetchDailyMetrics/syncAccount chamam a Graph API de
// verdade usando o META_SYSTEM_USER_TOKEN do env (nunca um token vindo de "credentials" - a Meta
// usa um unico system user do Business para todas as contas, nao OAuth por cliente). disconnect
// e refreshCredentials continuam nao implementados neste bloco (fora do escopo pedido).
export const metaProvider: AdsProvider = {
  name: PROVIDER_NAME,

  async validateConnection(_credentials: AdsProviderCredentials): Promise<boolean> {
    try {
      await listMetaAdAccounts();
      return true;
    } catch (error) {
      if (error instanceof MetaApiError) return false;
      throw error;
    }
  },

  async listAccounts(_credentials: AdsProviderCredentials): Promise<ProviderAccountRef[]> {
    const accounts = await listMetaAdAccounts();
    return accounts.map((account) => ({ id: account.id, name: account.name }));
  },

  async fetchDailyMetrics(accountId: string, range: DateRange, _credentials: AdsProviderCredentials): Promise<DailyMetric[]> {
    const rows = await fetchMetaDailyInsights(accountId, range.start, range.end);
    return rows.map((row) => {
      const normalized = normalizeMetaDailyInsight(row);
      return {
        date: normalized.metricDate,
        accountId,
        investment: normalized.spend,
        leads: normalized.leads,
        clicks: normalized.clicks,
        impressions: normalized.impressions,
      };
    });
  },

  // credentials precisa trazer hublevelClientId e clientIntegrationId (setados pela rota que
  // dispara o sync) - sem isso nao ha como saber em qual linha de client_integrations gravar.
  async syncAccount(accountId: string, credentials: AdsProviderCredentials): Promise<void> {
    const clientIntegrationId = credentials.clientIntegrationId;
    if (typeof clientIntegrationId !== 'string' || !clientIntegrationId) {
      throw new Error('syncAccount (meta): credentials.clientIntegrationId e obrigatorio.');
    }

    const lookbackDays =
      typeof credentials.lookbackDays === 'number' && credentials.lookbackDays > 0
        ? credentials.lookbackDays
        : DEFAULT_SYNC_LOOKBACK_DAYS;

    const since = daysAgoIsoDate(lookbackDays);
    const until = todayIsoDate();

    const rows = await fetchMetaDailyInsights(accountId, since, until);
    const currencyCode = typeof credentials.currencyCode === 'string' ? credentials.currencyCode : null;
    const actorId = typeof credentials.actorId === 'string' ? credentials.actorId : null;

    const records = rows.map((row) => {
      const normalized = normalizeMetaDailyInsight(row);
      return {
        clientIntegrationId,
        clientId: credentials.hublevelClientId,
        provider: toDbProviderCode(PROVIDER_NAME),
        externalAccountId: accountId,
        metricDate: normalized.metricDate,
        spend: normalized.spend,
        impressions: normalized.impressions,
        reach: normalized.reach,
        clicks: normalized.clicks,
        ctr: normalized.ctr,
        cpc: normalized.cpc,
        cpm: normalized.cpm,
        leads: normalized.leads,
        conversions: normalized.conversions,
        conversionValue: normalized.conversionValue,
        roas: normalized.roas,
        currencyCode,
        rawMetrics: normalized.rawMetrics,
        actorId,
      };
    });

    await upsertDailyMetrics(records);
  },

  async disconnect(_accountId: string): Promise<void> {
    throw new ProviderNotImplementedError(PROVIDER_NAME, 'disconnect');
  },

  async refreshCredentials(_credentials: AdsProviderCredentials): Promise<AdsProviderCredentials> {
    throw new ProviderNotImplementedError(PROVIDER_NAME, 'refreshCredentials');
  },

  async getConnectionStatus(_accountId?: string): Promise<ConnectionStatus> {
    return {
      provider: PROVIDER_NAME,
      status: 'not_connected',
      lastSyncAt: null,
      errorMessage: null,
    };
  },
};
