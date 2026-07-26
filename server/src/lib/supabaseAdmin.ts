import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';

// Cliente admin (service role) - uso exclusivo deste servidor backend, nunca exposto ao frontend.
// Sem persistencia/refresh de sessao: cada chamada e feita sob demanda por este processo, nao por
// um usuario autenticado no navegador.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
