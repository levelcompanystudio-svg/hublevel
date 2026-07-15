import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Update } from '../updates.types';
import { UpdateStatusBadge } from './UpdateStatusBadge';

interface UpdateTableProps {
  updates: Update[];
}

export function UpdateTable({ updates }: UpdateTableProps) {
  if (updates.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhuma atualizacao registrada"
          description="As atualizacoes de acompanhamento registradas para os clientes aparecerao aqui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Atualizacao</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Responsavel</th>
              <th className="px-5 py-3.5 font-semibold">Data</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {updates.map((update) => (
              <tr key={update.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{update.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{update.category || 'Sem categoria'}</p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  <Link to={`/app/clientes/${update.client_id}`} className="text-primary hover:underline">
                    {clientName(update)}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{responsibleName(update)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(update.update_date)}</td>
                <td className="px-5 py-4"><UpdateStatusBadge status={update.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/acompanhamento/${update.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    <Link to={`/app/acompanhamento/${update.id}/editar`}>
                      <Button type="button">Editar</Button>
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

export function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

export function clientName(update: Update): string {
  const client = Array.isArray(update.client) ? update.client[0] : update.client;
  return client?.trade_name || client?.company_name || 'Cliente';
}

export function responsibleName(update: Update): string {
  const responsible = Array.isArray(update.responsible) ? update.responsible[0] : update.responsible;
  return responsible?.name || 'Sem responsavel';
}
