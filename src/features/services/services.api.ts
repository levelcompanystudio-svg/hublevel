import { supabase } from '../../lib/supabase';
import type { Service, ServiceFormValues } from './services.types';

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizePrice(value: string): number | null {
  if (!value.trim()) return null;
  return Number(value);
}

function toPayload(values: ServiceFormValues) {
  return {
    name: values.name.trim(),
    description: normalizeNullable(values.description),
    category: normalizeNullable(values.category),
    default_price: normalizePrice(values.default_price),
    billing_cycle: values.billing_cycle || null,
    status: values.status,
    notes: normalizeNullable(values.notes),
  };
}

const serviceSelect = `
  id,
  name,
  description,
  category,
  default_price,
  billing_cycle,
  status,
  notes,
  created_at,
  updated_at
`;

export async function listServices(includeInactive: boolean): Promise<Service[]> {
  let query = supabase
    .from('services')
    .select(serviceSelect)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (!includeInactive) {
    query = query.eq('status', 'ativo');
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getService(id: string, includeInactive: boolean): Promise<Service> {
  let query = supabase
    .from('services')
    .select(serviceSelect)
    .eq('id', id)
    .is('deleted_at', null);

  if (!includeInactive) {
    query = query.eq('status', 'ativo');
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Servico nao encontrado ou sem permissao de acesso.');

  return data as Service;
}

export async function createService(values: ServiceFormValues): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert(toPayload(values))
    .select(serviceSelect)
    .single();

  if (error) throw error;
  return data as Service;
}

export async function updateService(id: string, values: ServiceFormValues): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update(toPayload(values))
    .eq('id', id)
    .select(serviceSelect)
    .single();

  if (error) throw error;
  return data as Service;
}
