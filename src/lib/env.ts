/**
 * Environment configuration for HubLevel.
 *
 * Reads VITE_* environment variables and provides typed access.
 * All values are validated at import time to catch missing config early.
 */

function getEnvVar(key: string): string {
  const value = import.meta.env[key];

  if (!value || value.includes('PLACEHOLDER') || value.includes('placeholder')) {
    throw new Error(
      `[HubLevel] Variavel de ambiente "${key}" nao configurada. ` +
      'Configure o arquivo .env.local com valores reais do Supabase dev.'
    );
  }

  return value;
}

function getSupabasePublishableKey(): string {
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (publishableKey && !publishableKey.includes('PLACEHOLDER') && !publishableKey.includes('placeholder')) {
    return publishableKey;
  }

  if (anonKey && !anonKey.includes('PLACEHOLDER') && !anonKey.includes('placeholder')) {
    return anonKey;
  }

  throw new Error(
    '[HubLevel] Variavel de ambiente "VITE_SUPABASE_PUBLISHABLE_KEY" nao configurada. ' +
    'Configure essa chave no .env.local ou use VITE_SUPABASE_ANON_KEY como compatibilidade.'
  );
}

// URL publica do backend HubLevel (/server) - nunca um secret, so o endereco onde ele roda.
// Diferente de getEnvVar(), nao lanca erro se faltar: sem isso configurado, so as telas que
// dependem do servidor (Integracoes Meta/Google) ficam indisponiveis, o resto do app continua
// funcionando normalmente.
function getServerUrl(): string {
  const value = import.meta.env.VITE_HUBLEVEL_SERVER_URL;
  if (!value || value.includes('PLACEHOLDER') || value.includes('placeholder')) {
    return 'http://localhost:4000';
  }
  return value.replace(/\/$/, '');
}

export const env = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_PUBLISHABLE_KEY: getSupabasePublishableKey(),
  SERVER_URL: getServerUrl(),
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
