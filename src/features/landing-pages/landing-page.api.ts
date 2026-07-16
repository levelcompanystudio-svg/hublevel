import { supabase } from '../../lib/supabase';
import { faqTextToArray } from './landing-page.types';
import type { ClientLandingPage, LandingPageBriefingValues } from './landing-page.types';

const landingPageSelect = `
  id,
  client_id,
  status,
  display_name,
  legal_name,
  segment,
  city,
  state,
  headline,
  subheadline,
  offer_description,
  main_cta,
  whatsapp,
  contact_email,
  primary_color,
  secondary_color,
  logo_url,
  hero_image_url,
  faq,
  observations,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toPayload(values: LandingPageBriefingValues) {
  return {
    display_name: normalizeNullable(values.displayName),
    legal_name: normalizeNullable(values.legalName),
    segment: normalizeNullable(values.segment),
    city: normalizeNullable(values.city),
    state: normalizeNullable(values.state),
    headline: normalizeNullable(values.headline),
    subheadline: normalizeNullable(values.subheadline),
    offer_description: normalizeNullable(values.offerDescription),
    main_cta: normalizeNullable(values.mainCta),
    whatsapp: normalizeNullable(values.whatsapp),
    contact_email: normalizeNullable(values.contactEmail),
    primary_color: normalizeNullable(values.primaryColor),
    secondary_color: normalizeNullable(values.secondaryColor),
    logo_url: normalizeNullable(values.logoUrl),
    hero_image_url: normalizeNullable(values.heroImageUrl),
    faq: faqTextToArray(values.faq),
    observations: normalizeNullable(values.observations),
  };
}

export async function getClientLandingPage(clientId: string): Promise<ClientLandingPage | null> {
  const { data, error } = await supabase
    .from('client_landing_pages')
    .select(landingPageSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as ClientLandingPage | null;
}

export async function createClientLandingPage(
  clientId: string,
  values: LandingPageBriefingValues,
  userId: string,
): Promise<ClientLandingPage> {
  const { data, error } = await supabase
    .from('client_landing_pages')
    .insert({
      client_id: clientId,
      ...toPayload(values),
      created_by: userId,
      updated_by: userId,
    })
    .select(landingPageSelect)
    .single();

  if (error) throw error;
  return data as ClientLandingPage;
}

export async function updateClientLandingPage(
  id: string,
  values: LandingPageBriefingValues,
  userId: string,
): Promise<ClientLandingPage> {
  const { data, error } = await supabase
    .from('client_landing_pages')
    .update({
      ...toPayload(values),
      updated_by: userId,
    })
    .eq('id', id)
    .select(landingPageSelect)
    .single();

  if (error) throw error;
  return data as ClientLandingPage;
}
