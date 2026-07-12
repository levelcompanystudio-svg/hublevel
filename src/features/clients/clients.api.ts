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
      created_at,
      updated_at,
      responsible:profiles!clients_responsible_user_id_fkey(id, name, email)
    `)
    .single();

  if (error) throw error;
  return mapClient(data as ClientRow);
}
