import 'dotenv/config';
import { z } from 'zod';

// Env deste servidor e estritamente privado (nunca roda no browser). Nenhuma variavel VITE_
// deve existir aqui - o frontend continua consumindo suas proprias VITE_* via Vite, sem relacao
// com este processo.
//
// Bloco 2: Meta Ads passa a ser real, entao META_SYSTEM_USER_TOKEN e obrigatorio (token do
// system user do Business Meta, com acesso as contas de anuncio conectadas - nunca um token de
// usuario individual). META_APP_ID/META_APP_SECRET continuam apenas do lado servidor; quando
// META_APP_SECRET existir, o metaApiClient usa para calcular appsecret_proof (recomendacao de
// seguranca da Graph API), mas o fluxo funciona mesmo sem isso.
// Google Ads continua apenas estrutural neste bloco - GOOGLE_* seguem opcionais.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  SUPABASE_URL: z.string().url({ message: 'SUPABASE_URL deve ser uma URL valida do projeto Supabase.' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY e obrigatoria (uso interno apenas, nunca no frontend).'),

  META_SYSTEM_USER_TOKEN: z.string().min(1, 'META_SYSTEM_USER_TOKEN e obrigatoria para sincronizar contas Meta Ads de verdade.'),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_API_VERSION: z.string().default('v21.0'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Origin do frontend em producao, usado exclusivamente para a allowlist de CORS (ver server.ts).
  // Em desenvolvimento, http://localhost:5173 e sempre permitido independente desta variavel.
  FRONTEND_URL: z.string().url({ message: 'FRONTEND_URL deve ser uma URL valida (ex.: https://hublevel-production.up.railway.app).' }).optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const details = result.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Configuracao de ambiente invalida:\n${details}`);
  }

  return result.data;
}

export const env = loadEnv();
