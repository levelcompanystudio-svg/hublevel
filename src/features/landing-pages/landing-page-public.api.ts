import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { LandingPageAiGeneratedContent } from './landing-page-ai.types';
import type { LandingPageContentSource } from './landing-page-content';

export interface PublicLandingPageData {
  page: LandingPageContentSource & { id: string; status: string; slug: string | null };
  generatedContent: LandingPageAiGeneratedContent | null;
}

interface GetPublicLandingPageResponse {
  page?: PublicLandingPageData['page'];
  generated_content?: LandingPageAiGeneratedContent | null;
  error?: string;
}

// Chama a Edge Function publica `get-public-landing-page` (sem exigir sessao/login). Ela e a
// unica fonte de dados da rota /lp/:id: nunca consultamos `client_landing_pages` diretamente do
// frontend aqui, porque a RLS dessa tabela bloquearia (de proposito) qualquer leitura anonima.
export async function getPublicLandingPage(id: string): Promise<PublicLandingPageData | null> {
  const { data, error } = await supabase.functions.invoke<GetPublicLandingPageResponse>('get-public-landing-page', {
    body: { id },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error === 'Landing page not found.') return null;
      throw new Error(body?.error || error.message || 'Erro ao carregar a landing page.');
    }
    throw new Error(error.message || 'Erro ao carregar a landing page.');
  }

  if (!data?.page) return null;

  return {
    page: data.page,
    generatedContent: data.generated_content ?? null,
  };
}
