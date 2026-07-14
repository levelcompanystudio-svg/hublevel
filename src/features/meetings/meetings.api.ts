import { supabase } from '../../lib/supabase';
import { fromDatetimeLocalInput } from './meetings.types';
import type {
  Meeting,
  MeetingClientRef,
  MeetingCreatorRef,
  MeetingFormValues,
  MeetingParticipant,
} from './meetings.types';

type MeetingRow = Omit<Meeting, 'client' | 'creator'> & {
  client?: MeetingClientRef | MeetingClientRef[] | null;
  creator?: MeetingCreatorRef | MeetingCreatorRef[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapMeeting(row: MeetingRow): Meeting {
  return {
    ...row,
    client: firstRelation(row.client),
    creator: firstRelation(row.creator),
  };
}

function toMeetingParticipants(participantIds: string[], directory: MeetingParticipant[]): MeetingParticipant[] {
  return participantIds
    .map((id) => directory.find((participant) => participant.user_id === id))
    .filter((participant): participant is MeetingParticipant => Boolean(participant));
}

function toMeetingPayload(values: MeetingFormValues, directory: MeetingParticipant[]) {
  return {
    client_id: values.client_id || null,
    title: values.title.trim(),
    type: values.type,
    scheduled_at: fromDatetimeLocalInput(values.scheduled_at),
    status: values.status,
    participants: values.participant_ids.length > 0 ? toMeetingParticipants(values.participant_ids, directory) : null,
    agenda: normalizeNullable(values.agenda),
    notes: normalizeNullable(values.notes),
    decisions: normalizeNullable(values.decisions),
    next_steps: normalizeNullable(values.next_steps),
  };
}

const meetingSelect = `
  id,
  client_id,
  title,
  type,
  scheduled_at,
  status,
  participants,
  agenda,
  notes,
  decisions,
  next_steps,
  created_by_user_id,
  created_at,
  updated_at,
  client:clients!meetings_client_id_fkey(id, company_name, trade_name),
  creator:profiles!meetings_created_by_user_id_fkey(id, name)
`;

export async function listMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select(meetingSelect)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as MeetingRow[]).map(mapMeeting);
}

export async function listMeetingsByClient(clientId: string): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select(meetingSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as MeetingRow[]).map(mapMeeting);
}

export async function getMeeting(id: string): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .select(meetingSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Reuniao nao encontrada ou sem permissao de acesso.');

  return mapMeeting(data as MeetingRow);
}

export async function listMeetingClients(): Promise<MeetingClientRef[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MeetingClientRef[];
}

export async function listMeetingParticipantDirectory(): Promise<MeetingParticipant[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as Array<{ id: string; name: string }>).map((row) => ({ user_id: row.id, name: row.name }));
}

export async function createMeeting(
  values: MeetingFormValues,
  directory: MeetingParticipant[],
  userId: string,
): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      ...toMeetingPayload(values, directory),
      created_by_user_id: userId,
    })
    .select(meetingSelect)
    .single();

  if (error) throw error;
  return mapMeeting(data as MeetingRow);
}

export async function updateMeeting(
  id: string,
  values: MeetingFormValues,
  directory: MeetingParticipant[],
): Promise<Meeting> {
  const { data, error } = await supabase
    .from('meetings')
    .update(toMeetingPayload(values, directory))
    .eq('id', id)
    .select(meetingSelect)
    .single();

  if (error) throw error;
  return mapMeeting(data as MeetingRow);
}
