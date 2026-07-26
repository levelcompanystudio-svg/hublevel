import 'dotenv/config';
import { z } from 'zod';

// Env deste servidor e estritamente privado (nunca roda no browser). Nenhuma variavel VITE_
// deve existir aqui - o frontend continua consumindo suas proprias VITE_* via Vite, sem relacao
// com este processo. As chaves de Meta/Google ficam opcionais neste Bloco 1 (estrutura apenas,
// nenhuma chamada externa e feita ainda), mas ja documentadas para os proximos blocos.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  SUPABASE_URL: z.string().url({ message: 'SUPABASE_URL deve ser uma URL valida do projeto Supabase.' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY e obrigatoria (uso interno apenas, nunca no frontend).'),

  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
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
