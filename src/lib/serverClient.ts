import { env } from './env';
import { supabase } from './supabase';

// Cliente HTTP fino para o backend HubLevel (/server) - nunca guarda nem le nenhum secret aqui,
// so anexa o JWT da sessao Supabase do usuario logado (o mesmo token que o Supabase ja usa para
// RLS) como Authorization Bearer. O servidor valida esse token e checa o papel do usuario
// (requireAdmin) antes de fazer qualquer chamada real a Meta/Google.
async function getAuthHeader(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error('Sessao expirada. Faca login novamente para usar as integracoes.');
  }
  return `Bearer ${data.session.access_token}`;
}

interface ServerErrorBody {
  error?: string;
}

async function serverRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const authorization = await getAuthHeader();

  let response: Response;
  try {
    response = await fetch(`${env.SERVER_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('Nao foi possivel conectar ao servidor HubLevel. Verifique se o backend esta rodando.');
  }

  const body = (await response.json().catch(() => null)) as (T & ServerErrorBody) | null;

  if (!response.ok) {
    const message = body?.error || `Falha ao comunicar com o servidor (${response.status}).`;
    throw new Error(message);
  }

  return body as T;
}

export function serverGet<T>(path: string): Promise<T> {
  return serverRequest<T>(path, { method: 'GET' });
}

export function serverPost<T>(path: string, body?: unknown): Promise<T> {
  return serverRequest<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
