import type { Client } from '../clients/clients.types';

export type LandingPageStatus = 'draft' | 'ready' | 'published' | 'archived';

export interface ClientLandingPage {
  id: string;
  client_id: string;
  status: LandingPageStatus;
  slug: string | null;
  display_name: string | null;
  legal_name: string | null;
  segment: string | null;
  city: string | null;
  state: string | null;
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
  observations: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandingPageBriefingValues {
  displayName: string;
  legalName: string;
  segment: string;
  city: string;
  state: string;
  headline: string;
  subheadline: string;
  offerDescription: string;
  mainCta: string;
  whatsapp: string;
  contactEmail: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  heroImageUrl: string;
  faq: string;
  observations: string;
}

export const emptyLandingPageBriefingValues: LandingPageBriefingValues = {
  displayName: '',
  legalName: '',
  segment: '',
  city: '',
  state: '',
  headline: '',
  subheadline: '',
  offerDescription: '',
  mainCta: '',
  whatsapp: '',
  contactEmail: '',
  primaryColor: '',
  secondaryColor: '',
  logoUrl: '',
  heroImageUrl: '',
  faq: '',
  observations: '',
};

// FAQ e persistido como jsonb (array de strings); no formulario cada linha da
// textarea vira um item do array, mantendo a UI simples sem campos dinamicos.
export function faqArrayToText(faq: string[] | null | undefined): string {
  return (faq ?? []).join('\n');
}

export function faqTextToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function initialValuesForClient(client: Client): LandingPageBriefingValues {
  return {
    ...emptyLandingPageBriefingValues,
    displayName: client.trade_name ?? client.company_name,
    legalName: client.company_name,
    segment: client.segment ?? '',
  };
}

export function landingPageToValues(page: ClientLandingPage): LandingPageBriefingValues {
  return {
    displayName: page.display_name ?? '',
    legalName: page.legal_name ?? '',
    segment: page.segment ?? '',
    city: page.city ?? '',
    state: page.state ?? '',
    headline: page.headline ?? '',
    subheadline: page.subheadline ?? '',
    offerDescription: page.offer_description ?? '',
    mainCta: page.main_cta ?? '',
    whatsapp: page.whatsapp ?? '',
    contactEmail: page.contact_email ?? '',
    primaryColor: page.primary_color ?? '',
    secondaryColor: page.secondary_color ?? '',
    logoUrl: page.logo_url ?? '',
    heroImageUrl: page.hero_image_url ?? '',
    faq: faqArrayToText(page.faq),
    observations: page.observations ?? '',
  };
}

// --- Analise de briefing por IA -----------------------------------------------------------------
//
// A analise em si acontece na Edge Function `analyze-landing-briefing` (chave de IA nunca chega
// ao frontend). Nada aqui e persistido no banco: o resultado fica em memoria ate o usuario decidir
// aplicar ao formulario manual (e so entao salvar, como qualquer outra edicao do briefing).

export type LandingPageBriefingAnalysisStatus =
  | 'idle' // nenhum briefing selecionado
  | 'ready' // briefing selecionado, aguardando analise
  | 'analyzing' // chamando a IA
  | 'analyzed' // analise concluida, resultado pronto para aplicar
  | 'applied' // usuario ja aplicou o resultado ao formulario manual
  | 'error'; // falha na analise

export interface LandingPageBriefingAnalysisFaqItem {
  question: string;
  answer: string;
}

export interface LandingPageBriefingAnalysisSection {
  title: string;
  body: string;
}

export interface LandingPageBriefingAnalysisResult {
  companyName: string | null;
  segment: string | null;
  audience: string | null;
  offer: string | null;
  services: string[];
  differentiators: string[];
  painPoints: string[];
  objections: string[];
  faq: LandingPageBriefingAnalysisFaqItem[];
  toneOfVoice: string | null;
  suggestedCta: string | null;
  landingPageSections: LandingPageBriefingAnalysisSection[];
}

function buildAnalysisNotesBlock(analysis: LandingPageBriefingAnalysisResult): string {
  const lines: string[] = [];
  if (analysis.audience) lines.push(`Publico-alvo: ${analysis.audience}`);
  if (analysis.toneOfVoice) lines.push(`Tom de voz: ${analysis.toneOfVoice}`);
  if (analysis.services.length > 0) lines.push(`Servicos: ${analysis.services.join(', ')}`);
  if (analysis.differentiators.length > 0) lines.push(`Diferenciais: ${analysis.differentiators.join(', ')}`);
  if (analysis.painPoints.length > 0) lines.push(`Dores do cliente: ${analysis.painPoints.join(', ')}`);
  if (analysis.objections.length > 0) lines.push(`Objecoes: ${analysis.objections.join(', ')}`);
  if (analysis.landingPageSections.length > 0) {
    lines.push(`Secoes sugeridas: ${analysis.landingPageSections.map((section) => section.title).join(', ')}`);
  }
  if (lines.length === 0) return '';
  return `Sugestoes da analise de briefing (IA):\n${lines.join('\n')}`;
}

// Preenche os campos JA EXISTENTES do formulario manual com os dados sugeridos pela analise.
// So altera valores em memoria (o state do formulario) - nada e salvo ate o usuario clicar em
// "Salvar briefing". Campos sem correspondencia direta (publico, tom de voz, servicos,
// diferenciais, dores, objecoes, secoes sugeridas) sao anexados em "Observacoes" para nao se
// perderem, ja que o formulario nao tem um campo dedicado para cada um deles.
export function applyBriefingAnalysisToValues(
  values: LandingPageBriefingValues,
  analysis: LandingPageBriefingAnalysisResult,
): LandingPageBriefingValues {
  const notesBlock = buildAnalysisNotesBlock(analysis);
  const faqText =
    analysis.faq.length > 0
      ? analysis.faq.map((item) => (item.answer ? `${item.question} - ${item.answer}` : item.question)).join('\n')
      : values.faq;

  return {
    ...values,
    displayName: analysis.companyName?.trim() || values.displayName,
    segment: analysis.segment?.trim() || values.segment,
    offerDescription: analysis.offer?.trim() || values.offerDescription,
    mainCta: analysis.suggestedCta?.trim() || values.mainCta,
    faq: faqText,
    observations: [values.observations.trim(), notesBlock].filter(Boolean).join('\n\n'),
  };
}
