import type { AdsProviderName } from './types.js';

// Mapper explicito entre o codigo interno do provider (usado pelo contrato AdsProvider e pelo
// registry) e o valor gravado em public.client_integrations.provider / integration_sync_logs.provider
// / integration_daily_metrics.provider no banco (constraint check 'meta_ads' | 'google_ads').
// Os dois vocabularios sao intencionalmente diferentes: 'meta'/'google' e curto e usado so em
// codigo, 'meta_ads'/'google_ads' e o valor persistido - nunca comparar um com o outro direto.
export type ProviderDbCode = 'meta_ads' | 'google_ads';

const TO_DB_CODE: Record<AdsProviderName, ProviderDbCode> = {
  meta: 'meta_ads',
  google: 'google_ads',
};

const FROM_DB_CODE: Record<ProviderDbCode, AdsProviderName> = {
  meta_ads: 'meta',
  google_ads: 'google',
};

export function toDbProviderCode(name: AdsProviderName): ProviderDbCode {
  return TO_DB_CODE[name];
}

export function fromDbProviderCode(code: string): AdsProviderName | null {
  if (code === 'meta_ads' || code === 'google_ads') return FROM_DB_CODE[code];
  return null;
}
