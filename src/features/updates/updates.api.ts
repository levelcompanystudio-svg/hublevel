import { supabase } from '../../lib/supabase';
import type { Update, UpdateClientRef, UpdateFormValues, UpdateResponsibleRef } from './updates.types';

type UpdateRow = Omit<Update, 'client' | 'responsible'> & {
  client?: UpdateClientRef | UpdateClientRef[] | null;
  responsible?: UpdateResponsibleRef | UpdateResponsibleRef[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapUpdate(row: UpdateRow): Update {
  return {
    ...row,
    client: firstRelation(row.client),
    responsible: firstRelation(row.responsible),
  };
}

function toUpdatePayload(values: UpdateFormValues) {
  return {
    client_id: values.client_id,
    title: values.title.trim(),
    description: values.description.trim(),
    category: normalizeNullable(values.category),
    responsible_user_id: values.responsible_user_id,
    status: values.status,
    update_date: values.update_date,
    next_action: normalizeNullable(values.next_action),
    sent_to_client: values.sent_to_client,
  };
}

const updateSelect = `
  id,
  client_id,
  title,
  description,
  category,
  responsible_user_id,
  status,
  update_date,
  next_action,
  sent_to_client,
  created_at,
  updated_at,
  client:clients!updates_client_id_fkey(id, company_name, trade_name),
  responsible:profiles!updates_responsible_user_id_fkey(id, name)
`;

export async function listUpdates(): Promise<Update[]> {
  const { data, error } = await supabase
    .from('updates')
    .select(updateSelect)
    .is('deleted_at', null)
    .order('update_date', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as UpdateRow[]).map(mapUpdate);
}

export async function listUpdatesByClient(clientId: string): Promise<Update[]> {
  const { data, error } = await supabase
    .from('updates')
    .select(updateSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('update_date', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as UpdateRow[]).map(mapUpdate);
}

export async function getUpdate(id: string): Promise<Update> {
  const { data, error } = await supabase
    .from('updates')
    .select(updateSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Atualizacao nao encontrada ou sem permissao de acesso.');

  return mapUpdate(data as UpdateRow);
}

export async function listUpdateClients(): Promise<UpdateClientRef[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as UpdateClientRef[];
}

export async function listUpdateResponsibles(): Promise<UpdateResponsibleRef[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as UpdateResponsibleRef[];
}

export async function createUpdate(values: UpdateFormValues): Promise<Update> {
  const { data, error } = await supabase
    .from('updates')
    .insert(toUpdatePayload(values))
    .select(updateSelect)
    .single();

  if (error) throw error;
  return mapUpdate(data as UpdateRow);
}

export async function updateUpdate(id: string, values: UpdateFormValues): Promise<Update> {
  const { data, error } = await supabase
    .from('updates')
    .update(toUpdatePayload(values))
    .eq('id', id)
    .select(updateSelect)
    .single();

  if (error) throw error;
  return mapUpdate(data as UpdateRow);
}
