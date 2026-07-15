import { supabase } from '../../lib/supabase';
import type { RoleName } from '../auth/auth.types';
import type { OperationalAlert } from './alerts.types';

const RECENT_MEETING_STATUSES = ['agendada', 'realizada'];
const NON_OVERDUE_TASK_STATUSES = ['concluida', 'cancelada'];

interface ClientRef {
  id: string;
  company_name: string;
  trade_name: string | null;
}

function clientLabel(client: ClientRef): string {
  return client.trade_name || client.company_name;
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

async function fetchActiveClients(): Promise<ClientRef[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .eq('status', 'ativo')
    .is('deleted_at', null);

  if (error) throw error;
  return (data ?? []) as ClientRef[];
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

async function getClientsWithoutRecentUpdateAlerts(): Promise<OperationalAlert[]> {
  const [clients, recentSet] = await Promise.all([fetchActiveClients(), fetchClientIdsWithRecentUpdate()]);

  return clients
    .filter((client) => !recentSet.has(client.id))
    .map((client) => ({
      id: `update-${client.id}`,
      type: 'cliente_sem_atualizacao' as const,
      severity: 'media' as const,
      title: `${clientLabel(client)} sem atualizacao recente`,
      description: 'Nenhuma atualizacao registrada nos ultimos 7 dias.',
      clientId: client.id,
      clientName: clientLabel(client),
      referenceDate: null,
    }));
}

async function getClientsWithoutRecentMeetingAlerts(): Promise<OperationalAlert[]> {
  const [clients, recentSet] = await Promise.all([fetchActiveClients(), fetchClientIdsWithRecentMeeting()]);

  return clients
    .filter((client) => !recentSet.has(client.id))
    .map((client) => ({
      id: `meeting-${client.id}`,
      type: 'cliente_sem_reuniao' as const,
      severity: 'media' as const,
      title: `${clientLabel(client)} sem reuniao recente`,
      description: 'Nenhuma reuniao agendada ou realizada nos ultimos 30 dias.',
      clientId: client.id,
      clientName: clientLabel(client),
      referenceDate: null,
    }));
}

async function getOverdueTaskAlerts(): Promise<OperationalAlert[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, due_date, status, client:clients!tasks_client_id_fkey(id, company_name, trade_name)')
    .is('deleted_at', null)
    .not('due_date', 'is', null)
    .lt('due_date', todayDateOnly());

  if (error) throw error;

  type TaskRow = { id: string; title: string; due_date: string; status: string; client: ClientRef | ClientRef[] | null };

  return ((data ?? []) as TaskRow[])
    .filter((task) => !NON_OVERDUE_TASK_STATUSES.includes(task.status))
    .map((task) => {
      const client = firstRelation(task.client);
      return {
        id: `task-${task.id}`,
        type: 'tarefa_vencida' as const,
        severity: 'alta' as const,
        title: task.title,
        description: client
          ? `Prazo vencido em ${formatDate(task.due_date)} - ${clientLabel(client)}`
          : `Prazo vencido em ${formatDate(task.due_date)}`,
        clientId: client?.id ?? null,
        clientName: client ? clientLabel(client) : null,
        referenceDate: task.due_date,
      };
    });
}

async function getOverdueFinancialAlerts(): Promise<OperationalAlert[]> {
  const { data, error } = await supabase
    .from('financial_records')
    .select('id, description, amount, due_date, client:clients!financial_records_client_id_fkey(id, company_name, trade_name)')
    .is('deleted_at', null)
    .eq('status', 'atrasado');

  if (error) throw error;

  type FinancialRow = {
    id: string;
    description: string | null;
    amount: number;
    due_date: string;
    client: ClientRef | ClientRef[] | null;
  };

  return ((data ?? []) as FinancialRow[]).map((record) => {
    const client = firstRelation(record.client);
    return {
      id: `financial-${record.id}`,
      type: 'financeiro_atrasado' as const,
      severity: 'alta' as const,
      title: record.description || 'Registro financeiro em atraso',
      description: client
        ? `${formatCurrency(record.amount)} vencido em ${formatDate(record.due_date)} - ${clientLabel(client)}`
        : `${formatCurrency(record.amount)} vencido em ${formatDate(record.due_date)}`,
      clientId: client?.id ?? null,
      clientName: client ? clientLabel(client) : null,
      referenceDate: record.due_date,
    };
  });
}

const severityWeight: Record<OperationalAlert['severity'], number> = { alta: 0, media: 1 };

export async function getOperationalAlerts(role: RoleName): Promise<OperationalAlert[]> {
  const groups = await Promise.all([
    getClientsWithoutRecentUpdateAlerts(),
    getClientsWithoutRecentMeetingAlerts(),
    getOverdueTaskAlerts(),
    role === 'admin' ? getOverdueFinancialAlerts() : Promise.resolve([]),
  ]);

  return groups.flat().sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity]);
}
