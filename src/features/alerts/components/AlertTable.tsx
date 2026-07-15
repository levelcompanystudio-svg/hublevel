import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import type { AlertType, OperationalAlert } from '../alerts.types';
import { AlertPriorityBadge } from './AlertPriorityBadge';

interface AlertTableProps {
  alerts: OperationalAlert[];
}

const typeLabels: Record<AlertType, string> = {
  cliente_sem_atualizacao: 'Sem atualizacao',
  cliente_sem_reuniao: 'Sem reuniao',
  tarefa_vencida: 'Tarefa vencida',
  financeiro_atrasado: 'Financeiro atrasado',
};

export function AlertTable({ alerts }: AlertTableProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum alerta no momento"
          description="Nenhuma condicao de risco foi identificada com os dados atuais da operacao."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Alerta</th>
              <th className="px-5 py-3.5 font-semibold">Tipo</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Prioridade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alerts.map((alert) => (
              <tr key={alert.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{typeLabels[alert.type]}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {alert.clientId ? (
                    <Link to={`/app/clientes/${alert.clientId}`} className="text-primary hover:underline">
                      {alert.clientName}
                    </Link>
                  ) : (
                    alert.clientName ?? '-'
                  )}
                </td>
                <td className="px-5 py-4"><AlertPriorityBadge severity={alert.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
