import { supabase } from '../../lib/supabase';
import type { RoleName } from '../auth/auth.types';
import type {
  Deliverable,
  DeliverableClient,
  DeliverableFormValues,
  DeliverableProfile,
  DeliverableStatus,
} from './deliverables.types';

type DeliverableRow = Omit<Deliverable, 'client' | 'assignee'> & {
  client?: DeliverableClient | DeliverableClient[] | null;
  assignee?: DeliverableProfile | DeliverableProfile[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function completedAtFor(status: DeliverableStatus, current?: string | null): string | null {
  if (status === 'delivered' || status === 'approved') return current ?? new Date().toISOString();
  return null;
}

function mapDeliverable(row: DeliverableRow): Deliverable {
  return {
    ...row,
    client: firstRelation(row.client),
    assignee: firstRelation(row.assignee),
  };
}

function toPayload(values: DeliverableFormValues, currentCompletedAt?: string | null) {
  return {
    client_id: values.client_id,
    title: values.title.trim(),
    description: normalizeNullable(values.description),
    status: values.status,
    priority: values.priority,
    reference_month: values.reference_month || null,
    due_date: values.due_date || null,
    assigned_to: values.assigned_to || null,
    notes: normalizeNullable(values.notes),
    completed_at: completedAtFor(values.status, currentCompletedAt),
  };
}

const deliverableSelect = `
  id,
  client_id,
  title,
  description,
  status,
  priority,
  reference_month,
  due_date,
  completed_at,
  assigned_to,
  document_id,
  task_id,
  notes,
  created_by,
  updated_by,
  created_at,
  updated_at,
  client:clients!deliverables_client_id_fkey(id, company_name, trade_name),
  assignee:profiles!deliverables_assigned_to_fkey(id, name, email, roles(name))
`;

export async function listDeliverables(): Promise<Deliverable[]> {
  const { data, error } = await supabase
    .from('deliverables')
    .select(deliverableSelect)
    .is('deleted_at', null)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return ((data ?? []) as unknown as DeliverableRow[]).map(mapDeliverable);
}

export async function listDeliverablesByClient(clientId: string): Promise<Deliverable[]> {
  const { data, error } = await supabase
    .from('deliverables')
    .select(deliverableSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return ((data ?? []) as unknown as DeliverableRow[]).map(mapDeliverable);
}

export async function getDeliverable(id: string): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .select(deliverableSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Entregavel nao encontrado ou sem permissao de acesso.');
  return mapDeliverable(data as unknown as DeliverableRow);
}

export async function listDeliverableClients(): Promise<DeliverableClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DeliverableClient[];
}

export async function listAssignableProfiles(currentUserId: string, role: RoleName): Promise<DeliverableProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, roles(name)')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;

  const profiles = (data ?? []) as unknown as DeliverableProfile[];
  if (role === 'admin') return profiles;

  return profiles.filter((profile) => {
    const relation = firstRelation(profile.roles);
    return profile.id === currentUserId || relation?.name === 'colaborador';
  });
}

export async function createDeliverable(values: DeliverableFormValues, userId: string): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .insert({
      ...toPayload(values),
      created_by: userId,
      updated_by: userId,
    })
    .select(deliverableSelect)
    .single();

  if (error) throw error;
  return mapDeliverable(data as unknown as DeliverableRow);
}

export async function updateDeliverable(
  id: string,
  values: DeliverableFormValues,
  userId: string,
  currentCompletedAt: string | null,
): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      ...toPayload(values, currentCompletedAt),
      updated_by: userId,
    })
    .eq('id', id)
    .select(deliverableSelect)
    .single();

  if (error) throw error;
  return mapDeliverable(data as unknown as DeliverableRow);
}

// Usado pela tela de status do colaborador: atualiza apenas status/completed_at,
// nunca outros campos do entregavel (mesmo padrao de updateTaskStatus em tasks.api.ts).
export async function updateDeliverableStatus(id: string, status: DeliverableStatus, userId: string): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      status,
      completed_at: completedAtFor(status),
      updated_by: userId,
    })
    .eq('id', id)
    .select(deliverableSelect)
    .single();

  if (error) throw error;
  return mapDeliverable(data as unknown as DeliverableRow);
}
