import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type {
  LandingPageBriefingAnalysisFaqItem,
  LandingPageBriefingAnalysisResult,
  LandingPageBriefingAnalysisSection,
} from './landing-page.types';

interface AnalyzeLandingBriefingResponse {
  analysis?: LandingPageBriefingAnalysisResult;
  fetch_note?: string;
  error?: string;
}

export interface AnalyzeBriefingParams {
  clientId: string;
  documentId: string;
  externalUrl: string | null;
  fileUrl: string | null;
  title: string;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => stringOrNull(item)).filter((item): item is string => Boolean(item))
    : [];
}

function faqArray(value: unknown): LandingPageBriefingAnalysisFaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const question = stringOrNull(record.question);
      if (!question) return null;
      return {
        question,
        answer: stringOrNull(record.answer) ?? '',
      };
    })
    .filter((item): item is LandingPageBriefingAnalysisFaqItem => Boolean(item));
}

function sectionArray(value: unknown): LandingPageBriefingAnalysisSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = stringOrNull(record.title);
      if (!title) return null;
      return {
        title,
        body: stringOrNull(record.body) ?? '',
      };
    })
    .filter((item): item is LandingPageBriefingAnalysisSection => Boolean(item));
}

function normalizeAnalysis(value: unknown): LandingPageBriefingAnalysisResult {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return {
    companyName: stringOrNull(record.companyName),
    segment: stringOrNull(record.segment),
    audience: stringOrNull(record.audience),
    offer: stringOrNull(record.offer),
    services: stringArray(record.services),
    differentiators: stringArray(record.differentiators),
    painPoints: stringArray(record.painPoints),
    objections: stringArray(record.objections),
    faq: faqArray(record.faq),
    toneOfVoice: stringOrNull(record.toneOfVoice),
    suggestedCta: stringOrNull(record.suggestedCta),
    landingPageSections: sectionArray(record.landingPageSections),
  };
}

// A analise acontece inteiramente dentro da Edge Function `analyze-landing-briefing` (a chave
// OPENAI_API_KEY nunca fica no frontend). O frontend so envia identificadores e metadados do
// briefing ja anexado - nunca um secret, nunca o conteudo do arquivo (quem le o link e a function).
export async function analyzeBriefingDocument({
  clientId,
  documentId,
  externalUrl,
  fileUrl,
  title,
}: AnalyzeBriefingParams): Promise<LandingPageBriefingAnalysisResult> {
  const { data, error } = await supabase.functions.invoke<AnalyzeLandingBriefingResponse>('analyze-landing-briefing', {
    body: {
      client_id: clientId,
      document_id: documentId,
      external_url: externalUrl,
      file_url: fileUrl,
      title,
    },
  });

  if (error) {
    // FunctionsHttpError.message e generico ("Edge Function returned a non-2xx status code");
    // o corpo real do erro vem em error.context, que e o Response bruto da function.
    let message = error.message || 'Erro ao analisar o briefing com IA.';
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error) message = body.error;
    }
    throw new Error(message);
  }

  if (!data?.analysis) {
    throw new Error(data?.error || 'Resposta invalida da analise de briefing.');
  }

  return normalizeAnalysis(data.analysis);
}
