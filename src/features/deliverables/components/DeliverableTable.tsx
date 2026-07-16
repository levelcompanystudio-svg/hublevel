import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Deliverable } from '../deliverables.types';
import { DeliverablePriorityBadge } from './DeliverablePriorityBadge';
import { DeliverableStatusBadge } from './DeliverableStatusBadge';

interface DeliverableTableProps {
  items: Deliverable[];
  canEdit: boolean;
}

export function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

export function clientName(item: Deliverable): string {
  const client = Array.isArray(item.client) ? item.client[0] : item.client;
  return client?.trade_name || client?.company_name || '-';
}

export function assigneeName(item: Deliverable): string {
  const assignee = Array.isArray(item.assignee) ? item.assignee[0] : item.assignee;
  return assignee?.name ?? '-';
}

export function DeliverableTable({ items, canEdit }: DeliverableTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState title="Nenhum entregavel encontrado" description="Os entregaveis disponiveis para o seu papel aparecerao aqui." />
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
              <th className="px-5 py-3.5 font-semibold">Responsavel</th>
              <th className="px-5 py-3.5 font-semibold">Prioridade</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Prazo</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {item.reference_month && (
                    <p className="mt-1 text-xs text-muted-foreground">Referencia: {formatDate(item.reference_month)}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  <Link to={`/app/clientes/${item.client_id}`} className="text-primary hover:underline">
                    {clientName(item)}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{assigneeName(item)}</td>
                <td className="px-5 py-4"><DeliverablePriorityBadge priority={item.priority} /></td>
                <td className="px-5 py-4"><DeliverableStatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(item.due_date)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/entregaveis/${item.id}`}><Button type="button" variant="ghost">Ver</Button></Link>
                    {canEdit && <Link to={`/app/entregaveis/${item.id}/editar`}><Button type="button">Editar</Button></Link>}
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
