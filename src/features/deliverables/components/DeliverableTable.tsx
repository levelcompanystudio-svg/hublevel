import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Deliverable } from '../deliverables.types';
import { DeliverableOriginBadge } from './DeliverableOriginBadge';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';

interface DeliverableTableProps {
  items: Deliverable[];
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function DeliverableTable({ items }: DeliverableTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum entregavel encontrado"
          description="Tarefas com categoria de entrega, documentos operacionais e atualizacoes de entrega aparecerao aqui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Entregavel</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Origem</th>
              <th className="px-5 py-3.5 font-semibold">Responsavel</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Prazo/Data</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4 text-sm font-semibold text-foreground">{item.title}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {item.clientId ? (
                    <Link to={`/app/clientes/${item.clientId}`} className="text-primary hover:underline">
                      {item.clientName}
                    </Link>
                  ) : (
                    item.clientName ?? '-'
                  )}
                </td>
                <td className="px-5 py-4"><DeliverableOriginBadge origin={item.origin} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{item.responsibleName ?? '-'}</td>
                <td className="px-5 py-4"><DeliverableStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(item.referenceDate)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <Link to={item.linkTo}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
