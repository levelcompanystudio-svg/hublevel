import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import type { Client } from '../clients.types';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientCardProps {
  client: Client;
}

function formatDate(value: string | null) {
  if (!value) return 'Sem data';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function getHealthAccent(client: Client) {
  if (client.status === 'onboarding') return 'border-l-primary';
  if (client.status === 'pausado' || client.status === 'encerrado') return 'border-l-muted-foreground';
  if (client.health_status === 'saudavel') return 'border-l-success';
  if (client.health_status === 'atencao') return 'border-l-warning';
  return 'border-l-destructive';
}

export function ClientCard({ client }: ClientCardProps) {
  const shortNotes = client.notes && client.notes.length > 120
    ? `${client.notes.slice(0, 120).trim()}...`
    : client.notes;

  return (
    <Card
      className={`flex min-h-full flex-col gap-4 border-l-[3px] p-4 transition hover:border-primary/50 hover:bg-card-elevated ${getHealthAccent(client)}`}
    >
      <div className="flex flex-1 flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-foreground">{client.company_name}</h3>
            {client.trade_name && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{client.trade_name}</p>
            )}
          </div>
          <ClientHealthBadge status={client.health_status} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <ClientStatusBadge status={client.status} />
          {client.segment && (
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {client.segment}
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t border-border/70 pt-3 text-sm">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Responsavel</dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground">{client.responsible?.name ?? 'Nao definido'}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Inicio</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{formatDate(client.start_date)}</dd>
          </div>
        </dl>

        {shortNotes && (
          <p className="rounded-lg border border-border bg-surface/70 p-3 text-xs leading-5 text-muted-foreground">
            {shortNotes}
          </p>
        )}
      </div>

      <Link to={`/app/clientes/${client.id}`}>
        <Button type="button" variant="secondary" className="w-full">Abrir</Button>
      </Link>
    </Card>
  );
}
