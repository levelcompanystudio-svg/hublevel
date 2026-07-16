export type LandingPageAiGenerationStatus = 'generated' | 'approved' | 'discarded' | 'failed';

export interface LandingPageAiSection {
  title: string;
  body: string;
}

export interface LandingPageAiFaqItem {
  question: string;
  answer: string;
}

// Conteudo gerado pela IA: apenas texto/estrutura, sem nada executavel, sem dados de lead.
export interface LandingPageAiGeneratedContent {
  headline?: string;
  subheadline?: string;
  hero_cta?: string;
  sections?: LandingPageAiSection[];
  benefits?: string[];
  faq?: LandingPageAiFaqItem[];
  final_cta?: string;
}

export interface LandingPageAiGeneration {
  id: string;
  client_landing_page_id: string;
  client_id: string;
  status: LandingPageAiGenerationStatus;
  provider: string;
  model: string | null;
  prompt_version: string;
  generated_content: LandingPageAiGeneratedContent;
  error_message: string | null;
  generated_by: string | null;
  created_at: string;
}
