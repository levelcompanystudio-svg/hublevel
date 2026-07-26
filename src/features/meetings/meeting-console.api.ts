import { supabase } from '../../lib/supabase';
import { listClientMeetingSettings } from './client-meeting-settings.api';
import type { ClientMeetingSettings } from './client-meeting-settings.types';
import type { MeetingConsoleRow } from './meeting-console.types';

interface ResponsibleRef {
  id: string;
  name: string;
}

interface ActiveClientRow {
  id: string;
  company_name: string;
  trade_name: string | null;
  responsible_user_id: string;
  responsible?: ResponsibleRef | ResponsibleRef[] | null;
}

interface MeetingAggRow {
  id: string;
  client_id: string;
  scheduled_at: string;
  status: string;
}

interface MeetingAgg {
  lastAt: string | null;
  nextAt: string | null;
  nextId: string | null;
  overdueAt: string | null;
  overdueId: string | null;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

// Clientes "operacionais" para a tela de reunioes: em onboarding ja participam do ritmo de reunioes,
// pausado/encerrado saem da visao ativa. Excluir soft-deleted sempre.
async function fetchActiveClients(): Promise<ActiveClientRow[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name, responsible_user_id, responsible:profiles!clients_responsible_user_id_fkey(id, name)')
    .in('status', ['ativo', 'onboarding'])
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ActiveClientRow[];
}

async function fetchSettingsByClient(): Promise<Map<string, ClientMeetingSettings>> {
  const rows = await listClientMeetingSettings();
  const map = new Map<string, ClientMeetingSettings>();
  for (const row of rows) map.set(row.client_id, row);
  return map;
}

async function fetchMeetingAggregatesByClient(): Promise<Map<string, MeetingAgg>> {
  const { data, error } = await supabase
    .from('meetings')
    .select('id, client_id, scheduled_at, status')
    .is('deleted_at', null)
    .not('client_id', 'is', null)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;

  const nowIso = new Date().toISOString();
  const map = new Map<string, MeetingAgg>();

  for (const row of (data ?? []) as MeetingAggRow[]) {
    const agg = map.get(row.client_id) ?? { lastAt: null, nextAt: null, nextId: null, overdueAt: null, overdueId: null };

    if (row.status === 'realizada') {
      // ordenado ascendente por scheduled_at: a ultima ocorrencia processada e sempre a mais recente.
      agg.lastAt = row.scheduled_at;
    }

    if (row.status === 'agendada' || row.status === 'remarcada') {
      if (row.scheduled_at >= nowIso) {
        if (agg.nextAt === null) {
          agg.nextAt = row.scheduled_at;
          agg.nextId = row.id;
        }
      } else if (agg.overdueAt === null) {
        // primeira ocorrencia atrasada encontrada (ordem ascendente) = a mais antiga pendente.
        agg.overdueAt = row.scheduled_at;
        agg.overdueId = row.id;
      }
    }

    map.set(row.client_id, agg);
  }

  return map;
}

export async function getMeetingConsoleRows(): Promise<MeetingConsoleRow[]> {
  const [clients, settingsByClient, meetingsByClient] = await Promise.all([
    fetchActiveClients(),
    fetchSettingsByClient(),
    fetchMeetingAggregatesByClient(),
  ]);

  return clients.map((client): MeetingConsoleRow => {
    const responsible = firstRelation(client.responsible);
    const settings = settingsByClient.get(client.id);
    const agg = meetingsByClient.get(client.id);

    return {
      clientId: client.id,
      companyName: client.company_name,
      tradeName: client.trade_name,
      responsibleId: client.responsible_user_id,
      responsibleName: responsible?.name ?? 'Nao definido',
      frequency: settings?.frequency ?? 'mensal',
      customFrequencyDays: settings?.custom_frequency_days ?? null,
      expectedWeek: settings?.expected_week ?? 'sem_definicao',
      operationalStatus: settings?.operational_status ?? 'cliente_novo',
      postMeetingStatus: settings?.post_meeting_status ?? 'indisponivel',
      lastMeetingAt: agg?.lastAt ?? null,
      nextMeetingAt: agg?.nextAt ?? null,
      nextMeetingId: agg?.nextId ?? null,
      overdueMeetingAt: agg?.overdueAt ?? null,
      overdueMeetingId: agg?.overdueId ?? null,
    };
  });
}

export async function markMeetingAsRealizada(meetingId: string): Promise<void> {
  const { error } = await supabase.from('meetings').update({ status: 'realizada' }).eq('id', meetingId);
  if (error) throw error;
}

export async function listResponsibleOptions(): Promise<ResponsibleRef[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ResponsibleRef[];
}
