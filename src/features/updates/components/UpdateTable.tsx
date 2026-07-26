import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Update } from '../updates.types';
import { UpdateStatusBadge } from './UpdateStatusBadge';

interface UpdateTableProps {
  updates: Update[];
  hasAnyUpdates?: boolean;
  filtersActive?: boolean;
  onClearFilters?: () => void;
}

export function UpdateTable({ updates, hasAnyUpdates = updates.length > 0, filtersActive = false, onClearFilters }: UpdateTableProps) {
  if (updates.length === 0) {
    return (
      <Card>
        {!hasAnyUpdates ? (
          <EmptyState
            title="Nenhuma atualizacao registrada"
            description="As atualizacoes de acompanhamento registradas para os clientes aparecerao aqui."
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <EmptyState
              title="Nenhuma atualizacao corresponde aos filtros"
              description="Ajuste os filtros selecionados para ver outras atualizacoes."
            />
            {filtersActive && onClearFilters && (
              <Button type="button" variant="secondary" size="sm" onClick={onClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Atualizacao</th>
              <th className="px-4 py-3.5 font-semibold">Cliente</th>
              <th className="px-4 py-3.5 font-semibold">Responsavel</th>
              <th className="px-4 py-3.5 font-semibold">Data</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Proxima acao</th>
              <th className="px-4 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {updates.map((update) => (
              <tr key={update.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{update.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{update.category || 'Sem categoria'}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <Link to={`/app/clientes/${update.client_id}`} className="text-primary hover:underline">
                    {clientName(update)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{responsibleName(update)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(update.update_date)}</td>
                <td className="px-4 py-3"><UpdateStatusBadge status={update.status} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {update.next_action?.trim() ? 'Sim' : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link to={`/app/acompanhamento/${update.id}`}>
                      <Button type="button" variant="ghost" size="sm">Ver</Button>
                    </Link>
                    <Link to={`/app/acompanhamento/${update.id}/editar`}>
                      <Button type="button" variant="ghost" size="sm">Editar</Button>
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
