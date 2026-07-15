export type AlertType = 'cliente_sem_atualizacao' | 'cliente_sem_reuniao' | 'tarefa_vencida' | 'financeiro_atrasado';
export type AlertSeverity = 'media' | 'alta';

export interface OperationalAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  clientId: string | null;
  clientName: string | null;
  referenceDate: string | null;
}
