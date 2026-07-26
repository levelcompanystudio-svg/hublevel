export type MeetingFrequency = 'semanal' | 'quinzenal' | 'mensal' | '45_dias' | '60_dias' | 'personalizada';

export const MEETING_FREQUENCIES: MeetingFrequency[] = [
  'semanal',
  'quinzenal',
  'mensal',
  '45_dias',
  '60_dias',
  'personalizada',
];

export const meetingFrequencyLabels: Record<MeetingFrequency, string> = {
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  '45_dias': '45 dias',
  '60_dias': '60 dias',
  personalizada: 'Personalizada',
};

export type MeetingExpectedWeek = 'semana_1' | 'semana_2' | 'semana_3' | 'semana_4' | 'sem_definicao';

export const MEETING_EXPECTED_WEEKS: MeetingExpectedWeek[] = [
  'semana_1',
  'semana_2',
  'semana_3',
  'semana_4',
  'sem_definicao',
];

export const meetingExpectedWeekLabels: Record<MeetingExpectedWeek, string> = {
  semana_1: '1a semana',
  semana_2: '2a semana',
  semana_3: '3a semana',
  semana_4: '4a semana',
  sem_definicao: 'Sem definicao',
};

export type MeetingOperationalStatus =
  | 'indisponivel'
  | 'cliente_novo'
  | 'agendar_semana'
  | 'agendada'
  | 'realizada'
  | 'aguardando_retorno';

export const MEETING_OPERATIONAL_STATUSES: MeetingOperationalStatus[] = [
  'indisponivel',
  'cliente_novo',
  'agendar_semana',
  'agendada',
  'realizada',
  'aguardando_retorno',
];

export const meetingOperationalStatusLabels: Record<MeetingOperationalStatus, string> = {
  indisponivel: 'Indisponivel',
  cliente_novo: 'Cliente novo',
  agendar_semana: 'Agendar semana',
  agendada: 'Agendada',
  realizada: 'Realizada',
  aguardando_retorno: 'Aguardando retorno',
};

export type MeetingPostStatus = 'indisponivel' | 'pendente' | 'feito';

export const MEETING_POST_STATUSES: MeetingPostStatus[] = ['indisponivel', 'pendente', 'feito'];

export const meetingPostStatusLabels: Record<MeetingPostStatus, string> = {
  indisponivel: 'Indisponivel',
  pendente: 'Pendente',
  feito: 'Feito',
};

export interface ClientMeetingSettings {
  id: string;
  client_id: string;
  frequency: MeetingFrequency;
  custom_frequency_days: number | null;
  expected_week: MeetingExpectedWeek;
  operational_status: MeetingOperationalStatus;
  post_meeting_status: MeetingPostStatus;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface ClientMeetingSettingsPatch {
  frequency?: MeetingFrequency;
  custom_frequency_days?: number | null;
  expected_week?: MeetingExpectedWeek;
  operational_status?: MeetingOperationalStatus;
  post_meeting_status?: MeetingPostStatus;
}

export const defaultClientMeetingSettings: ClientMeetingSettingsPatch = {
  frequency: 'mensal',
  expected_week: 'sem_definicao',
  operational_status: 'cliente_novo',
  post_meeting_status: 'indisponivel',
};
