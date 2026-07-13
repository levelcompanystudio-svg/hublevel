import { supabase } from '../../lib/supabase';
import type {
  FinanceClient,
  FinancialRecord,
  FinancialRecordFormValues,
  Payment,
  PaymentFormValues,
} from './finance.types';

type FinancialRecordRow = Omit<FinancialRecord, 'client'> & {
  client?: FinanceClient | FinanceClient[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeAmount(value: string): number {
  return Number(value);
}

function normalizeCompetenceMonth(value: string): string {
  if (!value) return '';
  return value.length === 7 ? `${value}-01` : value;
}

function mapFinancialRecord(row: FinancialRecordRow): FinancialRecord {
  return {
    ...row,
    client: firstRelation(row.client),
  };
}

function toFinancialPayload(values: FinancialRecordFormValues, userId: string) {
  return {
    client_id: values.client_id,
    contract_id: null,
    competence_month: normalizeCompetenceMonth(values.competence_month),
    description: normalizeNullable(values.description),
    amount: normalizeAmount(values.amount),
    due_date: values.due_date,
    status: values.status,
    notes: normalizeNullable(values.notes),
    updated_by: userId,
  };
}

const financialRecordSelect = `
  id,
  client_id,
  contract_id,
  competence_month,
  description,
  amount,
  due_date,
  payment_date,
  status,
  notes,
  created_at,
  updated_at,
  client:clients!financial_records_client_id_fkey(id, company_name, trade_name)
`;

const paymentSelect = `
  id,
  financial_record_id,
  amount,
  paid_at,
  method,
  notes,
  created_at,
  updated_at
`;

export async function listFinancialRecords(): Promise<FinancialRecord[]> {
  const { data, error } = await supabase
    .from('financial_records')
    .select(financialRecordSelect)
    .is('deleted_at', null)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as FinancialRecordRow[]).map(mapFinancialRecord);
}

export async function getFinancialRecord(id: string): Promise<FinancialRecord> {
  const { data, error } = await supabase
    .from('financial_records')
    .select(financialRecordSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Registro financeiro nao encontrado ou sem permissao de acesso.');

  return mapFinancialRecord(data as FinancialRecordRow);
}

export async function listFinanceClients(): Promise<FinanceClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as FinanceClient[];
}

export async function createFinancialRecord(values: FinancialRecordFormValues, userId: string): Promise<FinancialRecord> {
  const { data, error } = await supabase
    .from('financial_records')
    .insert({
      ...toFinancialPayload(values, userId),
      created_by: userId,
    })
    .select(financialRecordSelect)
    .single();

  if (error) throw error;
  return mapFinancialRecord(data as FinancialRecordRow);
}

export async function updateFinancialRecord(id: string, values: FinancialRecordFormValues, userId: string): Promise<FinancialRecord> {
  const { data, error } = await supabase
    .from('financial_records')
    .update(toFinancialPayload(values, userId))
    .eq('id', id)
    .select(financialRecordSelect)
    .single();

  if (error) throw error;
  return mapFinancialRecord(data as FinancialRecordRow);
}

export async function listPayments(financialRecordId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(paymentSelect)
    .eq('financial_record_id', financialRecordId)
    .is('deleted_at', null)
    .order('paid_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function createPayment(financialRecordId: string, values: PaymentFormValues, userId: string): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      financial_record_id: financialRecordId,
      amount: normalizeAmount(values.amount),
      paid_at: values.paid_at,
      method: values.method || null,
      notes: normalizeNullable(values.notes),
      created_by: userId,
      updated_by: userId,
    })
    .select(paymentSelect)
    .single();

  if (error) throw error;

  const { error: updateError } = await supabase
    .from('financial_records')
    .update({
      status: 'pago',
      payment_date: values.paid_at.slice(0, 10),
      updated_by: userId,
    })
    .eq('id', financialRecordId);

  if (updateError) throw updateError;
  return data as Payment;
}
