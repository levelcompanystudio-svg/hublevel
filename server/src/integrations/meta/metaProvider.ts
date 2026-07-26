import type {
  AdsProvider,
  AdsProviderCredentials,
  ConnectionStatus,
  DailyMetric,
  DateRange,
  ProviderAccountRef,
} from '../core/types.js';
import { ProviderNotImplementedError } from '../core/types.js';

const PROVIDER_NAME = 'meta' as const;

// Placeholder do provider Meta Ads. Nenhum metodo aqui chama a Graph API - isso e trabalho de um
// bloco futuro. getConnectionStatus e a unica excecao: retorna um status estatico "not_connected"
// sem tocar em rede, so para o endpoint /integrations/meta/status ter uma resposta real hoje.
export const metaProvider: AdsProvider = {
  name: PROVIDER_NAME,

  async validateConnection(_credentials: AdsProviderCredentials): Promise<boolean> {
    throw new ProviderNotImplementedError(PROVIDER_NAME, 'validateConnection');
  },

  async listAccounts(_credentials: AdsProviderCredentials): Promise<ProviderAccountRef[]> {
    throw new ProviderNotImplementedError(PROVIDER_NAME, 'listAccounts');
  },

  async syncAccount(_accountId: string, _credentials: AdsProviderCredentials): Promise<void> {
    throw new ProviderNotImplementedError(PROVIDER_NAME, 'syncAccount');
  },

  async fetchDailyMetrics(
    _accountId: string,
    _range: DateRange,
    _credentials: AdsProviderCredentials,
  ): Promise<DailyMetric[]> {
    throw new ProviderNotImplementedError(PROVIDER_NAME, 'fetchDailyMetrics');
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
