export type LandingPageLeadStatus = 'novo' | 'contatado' | 'qualificado' | 'descartado';

export const LANDING_PAGE_LEAD_STATUSES: LandingPageLeadStatus[] = ['novo', 'contatado', 'qualificado', 'descartado'];

export const landingPageLeadStatusLabels: Record<LandingPageLeadStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  descartado: 'Descartado',
};

export interface LandingPageLeadContactedByRef {
  id: string;
  name: string;
}

export interface LandingPageLead {
  id: string;
  landing_page_id: string;
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  status: LandingPageLeadStatus;
  contacted_by: string | null;
  contacted_at: string | null;
  created_at: string;
  contactedByProfile?: LandingPageLeadContactedByRef | LandingPageLeadContactedByRef[] | null;
}

export function hasUtmData(lead: Pick<LandingPageLead, 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term'>): boolean {
  return Boolean(lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.utm_content || lead.utm_term);
}
