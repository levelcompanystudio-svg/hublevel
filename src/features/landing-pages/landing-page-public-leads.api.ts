import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export interface SubmitLandingPageLeadParams {
  landingPageId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  /** Honeypot: campo escondido que so um bot preencheria. Deve ir sempre vazio num envio real. */
  website: string;
}

interface CreateLandingPageLeadResponse {
  ok?: boolean;
  error?: string;
}

// Unico jeito de criar um lead: chama a Edge Function publica `create-landing-page-lead` (sem
// login). O `client_id` NAO e enviado daqui de proposito - a function resolve ele sozinha a
// partir do `landing_page_id`, no servidor, para nao confiar em nada vindo do navegador.
export async function submitLandingPageLead(params: SubmitLandingPageLeadParams): Promise<void> {
  const { data, error } = await supabase.functions.invoke<CreateLandingPageLeadResponse>('create-landing-page-lead', {
    body: {
      landing_page_id: params.landingPageId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      message: params.message,
      utm_source: params.utmSource,
      utm_medium: params.utmMedium,
      utm_campaign: params.utmCampaign,
      utm_content: params.utmContent,
      utm_term: params.utmTerm,
      website: params.website,
    },
  });

  if (error) {
    let message = error.message || 'Erro ao enviar o formulario. Tente novamente.';
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error) message = body.error;
    }
    throw new Error(message);
  }

  if (!data?.ok) {
    throw new Error(data?.error || 'Erro ao enviar o formulario. Tente novamente.');
  }
}
