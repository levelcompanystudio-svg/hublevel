import { supabase } from '../../lib/supabase';
import type { AdminDashboardMetrics, CollaboratorDashboardMetrics, ManagerDashboardMetrics } from './dashboard.types';

const NON_OVERDUE_TASK_STATUSES = ['concluida', 'cancelada'];
const RECENT_MEETING_STATUSES = ['agendada', 'realizada'];

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function currentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday.toISOString(), end: sunday.toISOString() };
}

async function fetchActiveClientIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('status', 'ativo')
    .is('deleted_at', null);

  if (error) throw error;
  return ((data ?? []) as Array<{ id: string }>).map((row) => row.id);
}

async function fetchClientIdsWithRecentUpdate(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('updates')
    .select('client_id')
    .is('deleted_at', null)
    .gte('update_date', daysAgoDateOnly(7));

  if (error) throw error;
  return new Set(((data ?? []) as Array<{ client_id: string }>).map((row) => row.client_id));
}

async function fetchClientIdsWithRecentMeeting(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('meetings')
    .select('client_id')
    .is('deleted_at', null)
    .not('client_id', 'is', null)
    .in('status', RECENT_MEETING_STATUSES)
    .gte('scheduled_at', new Date(daysAgoDateOnly(30)).toISOString());

  if (error) throw error;
  return new Set(
    ((data ?? []) as Array<{ client_id: string | null }>)
      .map((row) => row.client_id)
      .filter((clientId): clientId is string => Boolean(clientId)),
  );
}

async function countOverdueTasks(): Promise<number> {
  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .not('due_date', 'is', null)
    .lt('due_date', todayDateOnly())
    .not('status', 'in', `(${NON_OVERDUE_TASK_STATUSES.join(',')})`);

  if (error) throw error;
  return count ?? 0;
}

async function countTotalTasks(): Promise<number> {
  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null);

  if (error) throw error;
  return count ?? 0;
}

async function countOpenTasks(): Promise<number> {
  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .not('status', 'in', `(${NON_OVERDUE_TASK_STATUSES.join(',')})`);

  if (error) throw error;
  return count ?? 0;
}

async function countActiveClients(): Promise<number> {
  const { count, error } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ativo')
    .is('deleted_at', null);

  if (error) throw error;
  return count ?? 0;
}

function next7DaysRange(): { start: string; end: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function countMeetingsInRange(start: string, end: string): Promise<number> {
  const { count, error } = await supabase
    .from('meetings')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .gte('scheduled_at', start)
    .lte('scheduled_at', end);

  if (error) throw error;
  return count ?? 0;
}

const UPCOMING_MEETING_STATUSES = ['agendada', 'remarcada'];

async function countUpcomingMeetingsInRange(start: string, end: string): Promise<number> {
  const { count, error } = await supabase
    .from('meetings')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .in('status', UPCOMING_MEETING_STATUSES)
    .gte('scheduled_at', start)
    .lte('scheduled_at', end);

  if (error) throw error;
  return count ?? 0;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const { start, end } = currentWeekRange();

  const [
    activeClientIds,
    clientsWithRecentUpdate,
    clientsWithRecentMeeting,
    overdueTasks,
    meetingsThisWeek,
    financialRecords,
  ] = await Promise.all([
    fetchActiveClientIds(),
    fetchClientIdsWithRecentUpdate(),
    fetchClientIdsWithRecentMeeting(),
    countOverdueTasks(),
    countMeetingsInRange(start, end),
    supabase
      .from('financial_records')
      .select('client_id, status, amount')
      .is('deleted_at', null)
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as Array<{ client_id: string; status: string; amount: number }>;
      }),
  ]);

  const overdueClientIds = new Set(
    financialRecords.filter((record) => record.status === 'atrasado').map((record) => record.client_id),
  );
  const expectedRevenue = financialRecords
    .filter((record) => record.status === 'previsto' || record.status === 'atrasado')
    .reduce((sum, record) => sum + record.amount, 0);
  const receivedRevenue = financialRecords
    .filter((record) => record.status === 'pago')
    .reduce((sum, record) => sum + record.amount, 0);

  return {
    activeClients: activeClientIds.length,
    overdueClients: overdueClientIds.size,
    clientsWithoutRecentUpdate: activeClientIds.filter((id) => !clientsWithRecentUpdate.has(id)).length,
    clientsWithoutRecentMeeting: activeClientIds.filter((id) => !clientsWithRecentMeeting.has(id)).length,
    expectedRevenue,
    receivedRevenue,
    overdueTasks,
    meetingsThisWeek,
  };
}

export async function getManagerDashboardMetrics(): Promise<ManagerDashboardMetrics> {
  const { start, end } = currentWeekRange();

  const [
    myClientIds,
    activeClientIds,
    clientsWithRecentUpdate,
    clientsWithRecentMeeting,
    overdueTasks,
    meetingsThisWeek,
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('id')
      .is('deleted_at', null)
      .then(({ data, error }) => {
        if (error) throw error;
        return ((data ?? []) as Array<{ id: string }>).map((row) => row.id);
      }),
    fetchActiveClientIds(),
    fetchClientIdsWithRecentUpdate(),
    fetchClientIdsWithRecentMeeting(),
    countOverdueTasks(),
    countMeetingsInRange(start, end),
  ]);

  return {
    myClients: myClientIds.length,
    clientsWithoutRecentUpdate: activeClientIds.filter((id) => !clientsWithRecentUpdate.has(id)).length,
    clientsWithoutRecentMeeting: activeClientIds.filter((id) => !clientsWithRecentMeeting.has(id)).length,
    overdueTasks,
    meetingsThisWeek,
  };
}

export interface DashboardOperationalOverview {
  activeClients: number;
  openTasks: number;
  meetingsNext7Days: number;
}

// Cockpit operacional de /app/dashboard (admin/gestor): so contagens portfolio-wide, sem nenhum
// dado financeiro (isso fica exclusivo do Painel Administrativo). RLS ja restringe gestor aos
// proprios clientes em cada uma dessas tabelas, entao as contagens saem corretas por papel sem
// filtro manual aqui.
export async function getDashboardOperationalOverview(): Promise<DashboardOperationalOverview> {
  const { start, end } = next7DaysRange();

  const [activeClients, openTasks, meetingsNext7Days] = await Promise.all([
    countActiveClients(),
    countOpenTasks(),
    countUpcomingMeetingsInRange(start, end),
  ]);

  return { activeClients, openTasks, meetingsNext7Days };
}

export async function getCollaboratorDashboardMetrics(): Promise<CollaboratorDashboardMetrics> {
  const { start, end } = currentWeekRange();

  const [myTasks, overdueTasks, myMeetingsThisWeek] = await Promise.all([
    countTotalTasks(),
    countOverdueTasks(),
    countMeetingsInRange(start, end),
  ]);

  return {
    myTasks,
    overdueTasks,
    myMeetingsThisWeek,
  };
}
