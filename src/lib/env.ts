/**
 * Environment configuration for HubLevel.
 *
 * Reads VITE_* environment variables and provides typed access.
 * All values are validated at import time to catch missing config early.
 */

const fallbackEnv: Record<string, string> = {
  VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'placeholder-publishable-key',
};

function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value || value.includes('PLACEHOLDER')) {
    console.warn(
      `[HubLevel] Variavel de ambiente "${key}" nao configurada. ` +
      `Configure o arquivo .env com valores reais.`
    );
    return fallbackEnv[key] ?? '';
  }
  return value;
}

export const env = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_PUBLISHABLE_KEY: getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY'),
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
