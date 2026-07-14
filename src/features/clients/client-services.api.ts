import { supabase } from '../../lib/supabase';
import type { ClientService, ClientServiceCatalogItem, ClientServiceFormValues } from './client-services.types';

type ClientServiceRow = Omit<ClientService, 'service'> & {
  service?: ClientServiceCatalogItem | ClientServiceCatalogItem[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeAmount(value: string): number | null {
  if (!value.trim()) return null;
  return Number(value);
}

function mapClientService(row: ClientServiceRow): ClientService {
  return {
    ...row,
    service: firstRelation(row.service),
  };
}

function toClientServicePayload(values: ClientServiceFormValues) {
  return {
    service_id: values.service_id,
    status: values.status,
    monthly_value: normalizeAmount(values.monthly_value),
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    notes: normalizeNullable(values.notes),
  };
}

const clientServiceSelect = `
  id,
  client_id,
  service_id,
  status,
  monthly_value,
  start_date,
  end_date,
  notes,
  created_at,
  updated_at,
  service:services!client_services_service_id_fkey(id, name, category, default_price, billing_cycle, status)
`;

export async function listClientServices(clientId: string): Promise<ClientService[]> {
  const { data, error } = await supabase
    .from('client_services')
    .select(clientServiceSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ClientServiceRow[]).map(mapClientService);
}

export async function getClientService(id: string): Promise<ClientService> {
  const { data, error } = await supabase
    .from('client_services')
    .select(clientServiceSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Servico contratado nao encontrado ou sem permissao de acesso.');

  return mapClientService(data as ClientServiceRow);
}

export async function createClientService(clientId: string, values: ClientServiceFormValues): Promise<ClientService> {
  const { data, error } = await supabase
    .from('client_services')
    .insert({
      client_id: clientId,
      ...toClientServicePayload(values),
    })
    .select(clientServiceSelect)
    .single();

  if (error) throw error;
  return mapClientService(data as ClientServiceRow);
}

export async function updateClientService(id: string, values: ClientServiceFormValues): Promise<ClientService> {
  const { data, error } = await supabase
    .from('client_services')
    .update(toClientServicePayload(values))
    .eq('id', id)
    .select(clientServiceSelect)
    .single();

  if (error) throw error;
  return mapClientService(data as ClientServiceRow);
}
