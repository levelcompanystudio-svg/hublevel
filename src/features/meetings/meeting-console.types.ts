import type {
  MeetingExpectedWeek,
  MeetingFrequency,
  MeetingOperationalStatus,
  MeetingPostStatus,
} from './client-meeting-settings.types';

export interface MeetingConsoleRow {
  clientId: string;
  companyName: string;
  tradeName: string | null;
  responsibleId: string;
  responsibleName: string;
  frequency: MeetingFrequency;
  customFrequencyDays: number | null;
  expectedWeek: MeetingExpectedWeek;
  operationalStatus: MeetingOperationalStatus;
  postMeetingStatus: MeetingPostStatus;
  lastMeetingAt: string | null;
  nextMeetingAt: string | null;
  nextMeetingId: string | null;
  overdueMeetingAt: string | null;
  overdueMeetingId: string | null;
}

export type MeetingConsoleQuickFilter = 'todos' | 'sem_agendamento' | 'proximas' | 'atrasadas';

export const meetingConsoleQuickFilterLabels: Record<MeetingConsoleQuickFilter, string> = {
  todos: 'Todos',
  sem_agendamento: 'Sem agendamento',
  proximas: 'Reunioes proximas',
  atrasadas: 'Reunioes atrasadas',
};

const UPCOMING_WINDOW_DAYS = 7;

export function isUpcoming(row: MeetingConsoleRow, nowMs: number): boolean {
  if (!row.nextMeetingAt) return false;
  const diffMs = new Date(row.nextMeetingAt).getTime() - nowMs;
  return diffMs >= 0 && diffMs <= UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function isOverdue(row: MeetingConsoleRow): boolean {
  return row.overdueMeetingAt !== null;
}

export function hasNoScheduling(row: MeetingConsoleRow): boolean {
  return row.nextMeetingAt === null && row.overdueMeetingAt === null;
}

// Reuniao "pendente" para acoes rapidas: a atrasada tem prioridade (mais urgente), senao a futura.
export function pendingMeeting(row: MeetingConsoleRow): { id: string; scheduledAt: string } | null {
  if (row.overdueMeetingId && row.overdueMeetingAt) return { id: row.overdueMeetingId, scheduledAt: row.overdueMeetingAt };
  if (row.nextMeetingId && row.nextMeetingAt) return { id: row.nextMeetingId, scheduledAt: row.nextMeetingAt };
  return null;
}
