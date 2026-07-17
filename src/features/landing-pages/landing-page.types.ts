import type { Client } from '../clients/clients.types';

export type LandingPageStatus = 'draft' | 'ready' | 'published' | 'archived';

export interface ClientLandingPage {
  id: string;
  client_id: string;
  status: LandingPageStatus;
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

// --- Analise de briefing (preparacao para IA, etapa futura) -----------------------------------
//
// Nada abaixo chama IA, API externa ou salva no banco. E apenas o contrato de dados que o
// frontend ja deixa pronto para quando a analise automatica de um briefing anexado (documents
// com type = 'briefing') existir de verdade.

export type LandingPageBriefingAnalysisStatus = 'idle' | 'awaiting_analysis';

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
