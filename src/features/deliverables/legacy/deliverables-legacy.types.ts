export type DeliverableOrigin = 'tarefa' | 'documento' | 'update';
export type DeliverableStatus = 'pendente' | 'em_andamento' | 'concluido' | 'vencido';

export interface Deliverable {
  id: string;
  origin: DeliverableOrigin;
  title: string;
  clientId: string | null;
  clientName: string | null;
  status: DeliverableStatus;
  referenceDate: string | null;
  responsibleName: string | null;
  linkTo: string;
}
