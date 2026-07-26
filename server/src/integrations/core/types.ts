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
  syncAccount(accountId: string, credentials: AdsProviderCredentials): Promise<void>;
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
