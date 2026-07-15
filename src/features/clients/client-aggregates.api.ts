import { supabase } from '../../lib/supabase';
import type { ClientAggregate } from './client-aggregates.types';
import { emptyClientAggregate } from './client-aggregates.types';

const NON_OPEN_TASK_STATUSES = ['concluida', 'cancelada'];
const RECENT_MEETING_STATUSES = ['agendada', 'realizada'];

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

interface TaskAgg {
  open: number;
  overdue: number;
  checklistTotal: number;
  checklistDone: number;
}

async function fetchServiceCountsByClient(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('client_services')
    .select('client_id')
    .is('deleted_at', null)
    .eq('status', 'ativo');

  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ client_id: string }>) {
    map.set(row.client_id, (map.get(row.client_id) ?? 0) + 1);
  }
  return map;
}

async function fetchTaskAggregatesByClient(): Promise<Map<string, TaskAgg>> {
  const { data, error } = await supabase
    .from('tasks')
    .select('client_id, status, due_date')
    .is('deleted_at', null)
    .not('client_id', 'is', null);

  if (error) throw error;
  const today = todayDateOnly();
  const map = new Map<string, TaskAgg>();

  for (const row of (data ?? []) as Array<{ client_id: string; status: string; due_date: string | null }>) {
    const agg = map.get(row.client_id) ?? { open: 0, overdue: 0, checklistTotal: 0, checklistDone: 0 };
    const isOpen = !NON_OPEN_TASK_STATUSES.includes(row.status);

    if (isOpen) {
      agg.open += 1;
      if (row.due_date !== null && row.due_date < today) agg.overdue += 1;
    }

    if (row.status !== 'cancelada') {
      agg.checklistTotal += 1;
      if (row.status === 'concluida') agg.checklistDone += 1;
    }

    map.set(row.client_id, agg);
  }

  return map;
}

interface UpdateAgg {
  lastDate: string;
  recent: boolean;
}

async function fetchUpdateAggregatesByClient(): Promise<Map<string, UpdateAgg>> {
  const { data, error } = await supabase
    .from('updates')
    .select('client_id, update_date')
    .is('deleted_at', null)
    .order('update_date', { ascending: false });

  if (error) throw error;
  const recentThreshold = daysAgoDateOnly(7);
  const map = new Map<string, UpdateAgg>();

  for (const row of (data ?? []) as Array<{ client_id: string; update_date: string }>) {
    if (map.has(row.client_id)) continue; // primeira ocorrencia = mais recente, dado o order desc
    map.set(row.client_id, { lastDate: row.update_date, recent: row.update_date >= recentThreshold });
  }

  return map;
}

interface MeetingAgg {
  nextDate: string | null;
  recentOrUpcoming: boolean;
}

async function fetchMeetingAggregatesByClient(): Promise<Map<string, MeetingAgg>> {
  const { data, error } = await supabase
    .from('meetings')
    .select('client_id, scheduled_at, status')
    .is('deleted_at', null)
    .not('client_id', 'is', null)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  const nowIso = new Date().toISOString();
  const recentThresholdIso = new Date(daysAgoDateOnly(30)).toISOString();
  const map = new Map<string, MeetingAgg>();

  for (const row of (data ?? []) as Array<{ client_id: string; scheduled_at: string; status: string }>) {
    const agg = map.get(row.client_id) ?? { nextDate: null, recentOrUpcoming: false };

    if (RECENT_MEETING_STATUSES.includes(row.status) && row.scheduled_at >= recentThresholdIso) {
      agg.recentOrUpcoming = true;
    }
    if (agg.nextDate === null && row.status === 'agendada' && row.scheduled_at >= nowIso) {
      agg.nextDate = row.scheduled_at;
    }

    map.set(row.client_id, agg);
  }

  return map;
}

async function fetchRecentDocumentCountByClient(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('documents')
    .select('client_id')
    .is('deleted_at', null)
    .gte('created_at', new Date(daysAgoDateOnly(30)).toISOString());

  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ client_id: string }>) {
    map.set(row.client_id, (map.get(row.client_id) ?? 0) + 1);
  }
  return map;
}

// Busca em lote (uma query por tabela, independente do numero de clientes) e agrupa no
// frontend por client_id. Escala bem para o volume atual da carteira; se a base crescer
// muito, essas consultas devem ganhar paginacao/filtro por periodo mais estrito.
export async function getClientAggregates(): Promise<Map<string, ClientAggregate>> {
  const [services, tasks, updates, meetings, documents] = await Promise.all([
    fetchServiceCountsByClient(),
    fetchTaskAggregatesByClient(),
    fetchUpdateAggregatesByClient(),
    fetchMeetingAggregatesByClient(),
    fetchRecentDocumentCountByClient(),
  ]);

  const clientIds = new Set<string>([
    ...services.keys(),
    ...tasks.keys(),
    ...updates.keys(),
    ...meetings.keys(),
    ...documents.keys(),
  ]);

  const result = new Map<string, ClientAggregate>();
  for (const clientId of clientIds) {
    const taskAgg = tasks.get(clientId);
    const updateAgg = updates.get(clientId);
    const meetingAgg = meetings.get(clientId);

    result.set(clientId, {
      activeServices: services.get(clientId) ?? 0,
      openTasks: taskAgg?.open ?? 0,
      overdueTasks: taskAgg?.overdue ?? 0,
      checklistTotal: taskAgg?.checklistTotal ?? 0,
      checklistDone: taskAgg?.checklistDone ?? 0,
      lastUpdateDate: updateAgg?.lastDate ?? null,
      hasRecentUpdate: updateAgg?.recent ?? false,
      nextMeetingDate: meetingAgg?.nextDate ?? null,
      hasRecentOrUpcomingMeeting: meetingAgg?.recentOrUpcoming ?? false,
      recentDocuments: documents.get(clientId) ?? 0,
    });
  }

  return result;
}

export function getClientAggregate(map: Map<string, ClientAggregate>, clientId: string): ClientAggregate {
  return map.get(clientId) ?? emptyClientAggregate;
}
