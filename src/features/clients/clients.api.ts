import { supabase } from '../../lib/supabase';
import type { RoleName } from '../auth/auth.types';
import type { Client, ClientFormValues, ResponsibleProfile } from './clients.types';

type ClientRow = Omit<Client, 'responsible'> & {
  responsible?: ResponsibleProfile | ResponsibleProfile[] | null;
};

type ResponsibleRow = {
  id: string;
  name: string;
  email: string;
  roles?: { name: RoleName } | { name: RoleName }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toPayload(values: ClientFormValues, userId: string) {
  return {
    company_name: values.company_name.trim(),
    trade_name: normalizeNullable(values.trade_name),
    document_number: normalizeNullable(values.document_number),
    segment: normalizeNullable(values.segment),
    status: values.status,
    responsible_user_id: values.responsible_user_id,
    health_status: values.health_status,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    notes: normalizeNullable(values.notes),
    updated_by: userId,
  };
}

function mapClient(row: ClientRow): Client {
  return {
    ...row,
    responsible: firstRelation(row.responsible),
  };
}

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      company_name,
      trade_name,
      document_number,
      segment,
      status,
      responsible_user_id,
      health_status,
      start_date,
      end_date,
      notes,
      logo_url,
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ClientRow[]).map(mapClient);
}

export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      company_name,
      trade_name,
      document_number,
      segment,
      status,
      responsible_user_id,
      health_status,
      start_date,
      end_date,
      notes,
      logo_url,
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Cliente nao encontrado ou sem permissao de acesso.');

  return mapClient(data as ClientRow);
}

export async function listResponsibleProfiles(): Promise<ResponsibleProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, roles(name)')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as ResponsibleRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    roles: firstRelation(row.roles) ? { name: firstRelation(row.roles)?.name ?? 'colaborador' } : undefined,
  }));
}

export async function createClient(values: ClientFormValues, userId: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...toPayload(values, userId),
      created_by: userId,
    })
    .select(`
      id,
      company_name,
      trade_name,
      document_number,
      segment,
      status,
      responsible_user_id,
      health_status,
      start_date,
      end_date,
      notes,
      logo_url,
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .single();

  if (error) throw error;
  return mapClient(data as ClientRow);
}

export async function updateClient(id: string, values: ClientFormValues, userId: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(toPayload(values, userId))
    .eq('id', id)
    .select(`
      id,
      company_name,
      trade_name,
      document_number,
      segment,
      status,
      responsible_user_id,
      health_status,
      start_date,
      end_date,
      notes,
      logo_url,
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .single();

  if (error) throw error;
  return mapClient(data as ClientRow);
}

const LOGO_BUCKET = 'client-logos';
const MAX_LOGO_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

function getLogoPathFromPublicUrl(publicUrl: string | null): string | null {
  if (!publicUrl) return null;
  const marker = `/${LOGO_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

async function getCurrentLogoUrl(clientId: string): Promise<string | null> {
  const { data } = await supabase
    .from('clients')
    .select('logo_url')
    .eq('id', clientId)
    .maybeSingle();

  return data?.logo_url ?? null;
}

async function removeLogoObject(publicUrl: string | null): Promise<void> {
  const path = getLogoPathFromPublicUrl(publicUrl);
  if (!path) return;
  await supabase.storage.from(LOGO_BUCKET).remove([path]);
}

export function validateClientLogoFile(file: File): string | null {
  if (!ALLOWED_LOGO_MIME_TYPES.includes(file.type)) {
    return 'Formato nao suportado. Envie PNG, JPG, SVG ou WEBP.';
  }
  if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
    return 'Arquivo muito grande. O limite e 2MB.';
  }
  return null;
}

export async function uploadClientLogo(clientId: string, file: File, userId: string): Promise<Client> {
  const validationError = validateClientLogoFile(file);
  if (validationError) throw new Error(validationError);

  const previousLogoUrl = await getCurrentLogoUrl(clientId);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${clientId}/logo-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('clients')
    .update({ logo_url: publicUrlData.publicUrl, updated_by: userId })
    .eq('id', clientId)
    .select(`
      id,
      company_name,
      trade_name,
      document_number,
      segment,
      status,
      responsible_user_id,
      health_status,
      start_date,
      end_date,
      notes,
      logo_url,
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .single();

  if (error) {
    await supabase.storage.from(LOGO_BUCKET).remove([path]);
    throw error;
  }

  await removeLogoObject(previousLogoUrl);
  return mapClient(data as ClientRow);
}

export async function removeClientLogo(clientId: string, userId: string): Promise<Client> {
  const previousLogoUrl = await getCurrentLogoUrl(clientId);
  const { data, error } = await supabase
    .from('clients')
    .update({ logo_url: null, updated_by: userId })
    .eq('id', clientId)
    .select(`
      id,
      company_name,
      trade_name,
      document_number,
      segment,
      status,
      responsible_user_id,
      health_status,
      start_date,
      end_date,
      notes,
      logo_url,
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .single();

  if (error) throw error;
  await removeLogoObject(previousLogoUrl);
  return mapClient(data as ClientRow);
}
