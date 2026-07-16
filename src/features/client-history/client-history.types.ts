export type ClientHistoryEventType = 'task' | 'update' | 'meeting' | 'document' | 'deliverable' | 'landing_page';

export interface ClientHistoryEvent {
  id: string;
  type: ClientHistoryEventType;
  title: string;
  description: string | null;
  date: string;
  status?: string | null;
  actorName?: string | null;
  href?: string | null;
}

export const clientHistoryEventTypeLabels: Record<ClientHistoryEventType, string> = {
  task: 'Tarefa',
  update: 'Atualizacao',
  meeting: 'Reuniao',
  document: 'Documento',
  deliverable: 'Entregavel',
  landing_page: 'Landing page',
};
