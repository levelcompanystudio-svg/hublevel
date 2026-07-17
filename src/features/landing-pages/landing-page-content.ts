import type { LandingPageAiGeneratedContent } from './landing-page-ai.types';

export interface LandingPageContentSection {
  title: string;
  body: string;
}

export interface LandingPageContentFaqItem {
  question: string;
  answer: string;
}

export interface LandingPageContent {
  displayName: string;
  headline: string;
  subheadline: string;
  heroCta: string;
  finalCta: string;
  sections: LandingPageContentSection[];
  benefits: string[];
  faq: LandingPageContentFaqItem[];
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  whatsapp: string | null;
  contactEmail: string | null;
  location: string;
  hasContent: boolean;
  fromAi: boolean;
}

// Campos minimos do briefing necessarios para montar o conteudo (subset de ClientLandingPage,
// tambem compativel com o payload reduzido que a Edge Function publica devolve).
export interface LandingPageContentSource {
  display_name: string | null;
  headline: string | null;
  subheadline: string | null;
  offer_description: string | null;
  main_cta: string | null;
  whatsapp: string | null;
  contact_email: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  faq: string[] | null;
  city: string | null;
  state: string | null;
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validHexColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : null;
}

// Cada linha de FAQ do briefing e texto livre (sem separacao estrutural de pergunta/resposta),
// entao no fallback tratamos a linha inteira como "pergunta" e deixamos a resposta vazia.
function briefingFaqToContent(faq: string[] | null): LandingPageContentFaqItem[] {
  return (faq ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ question: line, answer: '' }));
}

// Fonte unica de verdade para montar o conteudo visual de uma landing page (usada pelo preview
// interno E pela pagina publica), garantindo que os dois mostrem exatamente a mesma coisa.
// Fonte textual: IA (quando existe conteudo gerado) com fallback campo a campo para o briefing.
// Contato e identidade visual sempre vem do briefing, ja que o conteudo gerado por IA nunca tem
// esses campos.
export function buildLandingPageContent(
  page: LandingPageContentSource | null,
  aiContent: LandingPageAiGeneratedContent | null,
): LandingPageContent {
  const displayName = page?.display_name?.trim() || 'Sua empresa';
  const headline = aiContent?.headline?.trim() || page?.headline?.trim() || '';
  const subheadline = aiContent?.subheadline?.trim() || page?.subheadline?.trim() || '';
  const heroCta = aiContent?.hero_cta?.trim() || page?.main_cta?.trim() || '';
  const finalCta = aiContent?.final_cta?.trim() || page?.main_cta?.trim() || heroCta;

  const sections: LandingPageContentSection[] =
    aiContent?.sections && aiContent.sections.length > 0
      ? aiContent.sections
      : page?.offer_description?.trim()
        ? [{ title: 'Sobre a oferta', body: page.offer_description.trim() }]
        : [];

  const benefits: string[] = aiContent?.benefits && aiContent.benefits.length > 0 ? aiContent.benefits : [];

  const faq: LandingPageContentFaqItem[] =
    aiContent?.faq && aiContent.faq.length > 0 ? aiContent.faq : briefingFaqToContent(page?.faq ?? null);

  return {
    displayName,
    headline,
    subheadline,
    heroCta,
    finalCta,
    sections,
    benefits,
    faq,
    primaryColor: validHexColor(page?.primary_color),
    secondaryColor: validHexColor(page?.secondary_color),
    logoUrl: page?.logo_url?.trim() || null,
    heroImageUrl: page?.hero_image_url?.trim() || null,
    whatsapp: page?.whatsapp?.trim() || null,
    contactEmail: page?.contact_email?.trim() || null,
    location: [page?.city?.trim(), page?.state?.trim()].filter(Boolean).join(' / '),
    hasContent: Boolean(headline || subheadline || sections.length > 0 || benefits.length > 0 || faq.length > 0),
    fromAi: Boolean(aiContent),
  };
}

export function whatsappDigits(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}
