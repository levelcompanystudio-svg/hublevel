import { supabase } from '../../lib/supabase';
import type { Contract, ContractClient, ContractFormValues } from './contracts.types';

type ContractRow = Omit<Contract, 'client'> & {
  client?: ContractClient | ContractClient[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapContract(row: ContractRow): Contract {
  return {
    ...row,
    client: firstRelation(row.client),
  };
}

function toContractPayload(values: ContractFormValues, userId: string) {
  const noticePeriod = normalizeNullable(values.notice_period_days);

  return {
    client_id: values.client_id,
    status: values.status,
    start_date: values.start_date,
    end_date: values.end_date || null,
    monthly_value: Number(values.monthly_value),
    billing_day: Number(values.billing_day),
    notice_period_days: noticePeriod !== null ? Number(noticePeriod) : null,
    notes: normalizeNullable(values.notes),
    updated_by: userId,
  };
}

const contractSelect = `
  id,
  client_id,
  document_id,
  status,
  start_date,
  end_date,
  monthly_value,
  billing_day,
  notice_period_days,
  notes,
  created_at,
  updated_at,
  client:clients!contracts_client_id_fkey(id, company_name, trade_name)
`;

export async function listContracts(): Promise<Contract[]> {
  const { data, error } = await supabase
    .from('contracts')
    .select(contractSelect)
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ContractRow[]).map(mapContract);
}

export async function getContract(id: string): Promise<Contract> {
  const { data, error } = await supabase
    .from('contracts')
    .select(contractSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Contrato nao encontrado ou sem permissao de acesso.');

  return mapContract(data as ContractRow);
}

export async function listContractClients(): Promise<ContractClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ContractClient[];
}

export async function createContract(values: ContractFormValues, userId: string): Promise<Contract> {
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      ...toContractPayload(values, userId),
      created_by: userId,
    })
    .select(contractSelect)
    .single();

  if (error) throw error;
  return mapContract(data as ContractRow);
}

export async function updateContract(id: string, values: ContractFormValues, userId: string): Promise<Contract> {
  const { data, error } = await supabase
    .from('contracts')
    .update(toContractPayload(values, userId))
    .eq('id', id)
    .select(contractSelect)
    .single();

  if (error) throw error;
  return mapContract(data as ContractRow);
}
