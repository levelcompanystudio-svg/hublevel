export type MeetingType = 'onboarding' | 'alinhamento' | 'performance' | 'comercial' | 'interna' | 'outro';
export type MeetingStatus = 'agendada' | 'realizada' | 'cancelada' | 'remarcada';

export interface MeetingParticipant {
  user_id: string;
  name: string;
}

export interface MeetingClientRef {
  id: string;
  company_name: string;
  trade_name: string | null;
}

export interface MeetingCreatorRef {
  id: string;
  name: string;
}

export interface Meeting {
  id: string;
  client_id: string | null;
  title: string;
  type: MeetingType;
  scheduled_at: string;
  status: MeetingStatus;
  participants: MeetingParticipant[] | null;
  agenda: string | null;
  notes: string | null;
  decisions: string | null;
  next_steps: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  client?: MeetingClientRef | MeetingClientRef[] | null;
  creator?: MeetingCreatorRef | MeetingCreatorRef[] | null;
}

export interface MeetingFormValues {
  client_id: string;
  title: string;
  type: MeetingType;
  scheduled_at: string;
  status: MeetingStatus;
  participant_ids: string[];
  agenda: string;
  notes: string;
  decisions: string;
  next_steps: string;
}

export const emptyMeetingFormValues: MeetingFormValues = {
  client_id: '',
  title: '',
  type: 'alinhamento',
  scheduled_at: '',
  status: 'agendada',
  participant_ids: [],
  agenda: '',
  notes: '',
  decisions: '',
  next_steps: '',
};

export function validateMeetingForm(values: MeetingFormValues): string | null {
  if (!values.title.trim()) return 'Informe um titulo para a reuniao.';
  if (!values.type) return 'Selecione o tipo da reuniao.';
  if (!values.scheduled_at) return 'Informe a data e hora da reuniao.';
  if (!values.status) return 'Selecione o status da reuniao.';
  return null;
}

export function toDatetimeLocalInput(isoValue: string): string {
  const date = new Date(isoValue);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalInput(value: string): string {
  return new Date(value).toISOString();
}
