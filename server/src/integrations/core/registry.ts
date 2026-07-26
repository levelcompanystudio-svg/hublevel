import { googleProvider } from '../google/googleProvider.js';
import { metaProvider } from '../meta/metaProvider.js';
import type { AdsProvider, AdsProviderName } from './types.js';

const providers: Record<AdsProviderName, AdsProvider> = {
  meta: metaProvider,
  google: googleProvider,
};

export function listProviderNames(): AdsProviderName[] {
  return Object.keys(providers) as AdsProviderName[];
}

export function getProvider(name: string): AdsProvider | null {
  if (name === 'meta' || name === 'google') return providers[name];
  return null;
}
