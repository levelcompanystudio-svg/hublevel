import { supabase } from '../../lib/supabase';
import type { LandingPageLead, LandingPageLeadStatus } from './landing-page-leads.types';

const leadSelect = `
  id,
  landing_page_id,
  client_id,
  name,
  email,
  phone,
  message,
  source,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term,
  status,
  contacted_by,
  contacted_at,
  created_at,
  contactedByProfile:profiles!landing_page_leads_contacted_by_fkey(id, name)
`;

// Leitura/atualizacao autenticada (admin/gestor), protegida pela RLS de `landing_page_leads`
// (migration 024). A criacao de leads NAO passa por aqui - so pela Edge Function publica.
export async function listLandingPageLeads(clientId: string): Promise<LandingPageLead[]> {
  const { data, error } = await supabase
    .from('landing_page_leads')
    .select(leadSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as LandingPageLead[];
}

export async function updateLandingPageLeadStatus(
  id: string,
  status: LandingPageLeadStatus,
  userId: string,
): Promise<LandingPageLead> {
  const isContacted = status !== 'novo';

  const { data, error } = await supabase
    .from('landing_page_leads')
    .update({
      status,
      contacted_by: isContacted ? userId : null,
      contacted_at: isContacted ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select(leadSelect)
    .single();

  if (error) throw error;
  return data as unknown as LandingPageLead;
}
