import { supabase } from '../../lib/supabase';

export type ActivityType = 'tarefa' | 'atualizacao' | 'reuniao' | 'documento';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  clientName: string | null;
  clientId: string | null;
  createdAt: string;
  href: string;
}

interface ClientRef {
  id: string;
  company_name: string;
  trade_name: string | null;
}

function clientLabel(client: ClientRef | ClientRef[] | null | undefined): string | null {
  const ref = Array.isArray(client) ? client[0] : client;
  if (!ref) return null;
  return ref.trade_name || ref.company_name;
}

function clientId(client: ClientRef | ClientRef[] | null | undefined): string | null {
  const ref = Array.isArray(client) ? client[0] : client;
  return ref?.id ?? null;
}

const PER_TABLE_LIMIT = 5;

async function fetchRecentTasks(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, created_at, client:clients!tasks_client_id_fkey(id, company_name, trade_name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(PER_TABLE_LIMIT);

  if (error) throw error;
  return ((data ?? []) as Array<{ id: string; title: string; created_at: string; client: ClientRef | ClientRef[] | null }>).map((row) => ({
    id: `task-${row.id}`,
    type: 'tarefa',
    title: `Nova tarefa: ${row.title}`,
    clientName: clientLabel(row.client),
    clientId: clientId(row.client),
    createdAt: row.created_at,
    href: `/app/tarefas/${row.id}`,
  }));
}

async function fetchRecentUpdates(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('updates')
    .select('id, title, created_at, client:clients!updates_client_id_fkey(id, company_name, trade_name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(PER_TABLE_LIMIT);

  if (error) throw error;
  return ((data ?? []) as Array<{ id: string; title: string; created_at: string; client: ClientRef | ClientRef[] | null }>).map((row) => ({
    id: `update-${row.id}`,
    type: 'atualizacao',
    title: `Atualizacao registrada: ${row.title}`,
    clientName: clientLabel(row.client),
    clientId: clientId(row.client),
    createdAt: row.created_at,
    href: `/app/acompanhamento/${row.id}`,
  }));
}

async function fetchRecentMeetings(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, created_at, client:clients!meetings_client_id_fkey(id, company_name, trade_name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(PER_TABLE_LIMIT);

  if (error) throw error;
  return ((data ?? []) as Array<{ id: string; title: string; created_at: string; client: ClientRef | ClientRef[] | null }>).map((row) => ({
    id: `meeting-${row.id}`,
    type: 'reuniao',
    title: `Reuniao agendada: ${row.title}`,
    clientName: clientLabel(row.client),
    clientId: clientId(row.client),
    createdAt: row.created_at,
    href: `/app/reunioes/${row.id}`,
  }));
}

async function fetchRecentDocuments(): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, created_at, client:clients!documents_client_id_fkey(id, company_name, trade_name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(PER_TABLE_LIMIT);

  if (error) throw error;
  return ((data ?? []) as Array<{ id: string; title: string; created_at: string; client: ClientRef | ClientRef[] | null }>).map((row) => ({
    id: `document-${row.id}`,
    type: 'documento',
    title: `Documento anexado: ${row.title}`,
    clientName: clientLabel(row.client),
    clientId: clientId(row.client),
    createdAt: row.created_at,
    href: `/app/documentos/${row.id}`,
  }));
}

// Feed de atividade do portfolio inteiro: busca so os N mais recentes de cada tabela (sem
// varrer tudo) e faz merge-sort no cliente. RLS de cada tabela ja restringe gestor aos proprios
// clientes, entao nao precisa filtro manual de responsavel aqui.
export async function getRecentPortfolioActivity(limit = 6): Promise<ActivityItem[]> {
  const [tasks, updates, meetings, documents] = await Promise.all([
    fetchRecentTasks(),
    fetchRecentUpdates(),
    fetchRecentMeetings(),
    fetchRecentDocuments(),
  ]);

  return [...tasks, ...updates, ...meetings, ...documents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
