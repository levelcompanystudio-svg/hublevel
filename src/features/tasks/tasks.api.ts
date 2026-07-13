import { supabase } from '../../lib/supabase';
import type { RoleName } from '../auth/auth.types';
import type { Task, TaskClient, TaskFormValues, TaskProfile, TaskStatus } from './tasks.types';

type TaskRow = Task;

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function completedAtFor(status: TaskStatus, current?: string | null): string | null {
  if (status === 'concluida') return current ?? new Date().toISOString();
  return null;
}

function toPayload(values: TaskFormValues, currentCompletedAt?: string | null) {
  return {
    client_id: values.client_id || null,
    title: values.title.trim(),
    description: normalizeNullable(values.description),
    assigned_to_user_id: values.assigned_to_user_id || null,
    priority: values.priority,
    status: values.status,
    due_date: values.due_date || null,
    category: normalizeNullable(values.category),
    notes: normalizeNullable(values.notes),
    completed_at: completedAtFor(values.status, currentCompletedAt),
  };
}

function mapTask(row: TaskRow): Task {
  return {
    ...row,
    client: firstRelation(row.client),
    assignee: firstRelation(row.assignee),
    creator: firstRelation(row.creator),
  };
}

const taskSelect = `
  id,
  client_id,
  title,
  description,
  assigned_to_user_id,
  created_by_user_id,
  priority,
  status,
  due_date,
  category,
  notes,
  completed_at,
  created_at,
  updated_at,
  client:clients!tasks_client_id_fkey(id, company_name, trade_name),
  assignee:profiles!tasks_assigned_to_user_id_fkey(id, name, email, roles(name)),
  creator:profiles!tasks_created_by_user_id_fkey(id, name, email, roles(name))
`;

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(taskSelect)
    .is('deleted_at', null)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return ((data ?? []) as unknown as TaskRow[]).map(mapTask);
}

export async function getTask(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select(taskSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Tarefa nao encontrada ou sem permissao de acesso.');
  return mapTask(data as unknown as TaskRow);
}

export async function listTaskClients(): Promise<TaskClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TaskClient[];
}

export async function listAssignableProfiles(currentUserId: string, role: RoleName): Promise<TaskProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, roles(name)')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;

  const profiles = (data ?? []) as unknown as TaskProfile[];
  if (role === 'admin') return profiles;

  return profiles.filter((profile) => {
    const relation = firstRelation(profile.roles);
    return profile.id === currentUserId || relation?.name === 'colaborador';
  });
}

export async function createTask(values: TaskFormValues, userId: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...toPayload(values),
      created_by_user_id: userId,
    })
    .select(taskSelect)
    .single();

  if (error) throw error;
  return mapTask(data as unknown as TaskRow);
}

export async function updateTask(id: string, values: TaskFormValues, currentCompletedAt: string | null): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(toPayload(values, currentCompletedAt))
    .eq('id', id)
    .select(taskSelect)
    .single();

  if (error) throw error;
  return mapTask(data as unknown as TaskRow);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      completed_at: completedAtFor(status),
    })
    .eq('id', id)
    .select(taskSelect)
    .single();

  if (error) throw error;
  return mapTask(data as unknown as TaskRow);
}
