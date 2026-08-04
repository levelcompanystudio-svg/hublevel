// Contrato comum que qualquer provedor de anuncios (Meta, Google, futuros outros) precisa
// implementar. Neste Bloco 1 nenhum provedor faz chamada externa real - so a estrutura/contrato
// esta pronta para os proximos blocos preencherem com integracao de verdade.

export type AdsProviderName = 'meta' | 'google';

export type ConnectionStatusValue = 'not_connected' | 'pending' | 'connected' | 'error';

export interface ProviderAccountRef {
  id: string;
  name: string;
}

export interface ConnectionStatus {
  provider: AdsProviderName;
  status: ConnectionStatusValue;
  lastSyncAt: string | null;
  errorMessage: string | null;
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  accountId: string;
  investment: number;
  leads: number;
  clicks: number;
  impressions: number;
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

// Resultado de syncAccount - permite ao caller (routes/connections.ts) registrar no
// integration_sync_logs.metadata quantas linhas realmente vieram/foram gravadas, em vez de so
// saber que a promise resolveu sem lancar. rowsFetched/rowsNormalized coincidem hoje (todo
// provider mapeia 1:1 linha bruta -> registro normalizado), mas ficam separados no contrato para
// nao esconder o dado se um provider futuro passar a descartar linhas na normalizacao.
export interface SyncResult {
  rowsFetched: number;
  rowsNormalized: number;
  rowsSaved: number;
  dateFrom: string;
  dateTo: string;
}

// Credenciais de uma conta especifica. Nunca deve conter valores reais neste Bloco 1 -
// os providers placeholder nao leem nem validam nada aqui de fato.
export interface AdsProviderCredentials {
  hublevelClientId: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface AdsProvider {
  readonly name: AdsProviderName;

  validateConnection(credentials: AdsProviderCredentials): Promise<boolean>;
  listAccounts(credentials: AdsProviderCredentials): Promise<ProviderAccountRef[]>;
  syncAccount(accountId: string, credentials: AdsProviderCredentials): Promise<SyncResult>;
  fetchDailyMetrics(accountId: string, range: DateRange, credentials: AdsProviderCredentials): Promise<DailyMetric[]>;
  disconnect(accountId: string): Promise<void>;
  refreshCredentials(credentials: AdsProviderCredentials): Promise<AdsProviderCredentials>;
  getConnectionStatus(accountId?: string): Promise<ConnectionStatus>;
}

// Erro padrao para todo metodo de provider ainda nao implementado neste bloco -
// deixa explicito no log/response que a chamada externa real ainda nao existe.
export class ProviderNotImplementedError extends Error {
  constructor(provider: AdsProviderName, method: string) {
    super(`Provider "${provider}" ainda nao implementa "${method}" (Bloco 1: apenas estrutura, sem integracao real).`);
    this.name = 'ProviderNotImplementedError';
  }
}
