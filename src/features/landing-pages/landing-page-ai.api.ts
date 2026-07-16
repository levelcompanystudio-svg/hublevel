import { supabase } from '../../lib/supabase';
import type { LandingPageAiGeneration } from './landing-page-ai.types';

const generationSelect = `
  id,
  client_landing_page_id,
  client_id,
  status,
  provider,
  model,
  prompt_version,
  generated_content,
  error_message,
  generated_by,
  created_at
`;

export async function getLatestLandingPageAiGeneration(clientId: string): Promise<LandingPageAiGeneration | null> {
  const { data, error } = await supabase
    .from('landing_page_ai_generations')
    .select(generationSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as LandingPageAiGeneration | null;
}

interface GenerateLandingPageCopyResponse {
  generation?: LandingPageAiGeneration;
  error?: string;
}

// A chamada de IA acontece inteiramente dentro da Edge Function `generate-landing-page-copy`
// (a chave OPENAI_API_KEY nunca fica no frontend). Aqui so invocamos a function autenticada,
// exatamente como qualquer outra chamada Supabase do app.
export async function generateLandingPageCopy(clientId: string): Promise<LandingPageAiGeneration> {
  const { data, error } = await supabase.functions.invoke<GenerateLandingPageCopyResponse>('generate-landing-page-copy', {
    body: { client_id: clientId },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao gerar conteudo com IA.');
  }

  if (!data?.generation) {
    throw new Error(data?.error || 'Resposta invalida da geracao por IA.');
  }

  return data.generation;
}
