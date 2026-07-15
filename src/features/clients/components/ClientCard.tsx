import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import type { ClientAggregate } from '../client-aggregates.types';
import type { Client } from '../clients.types';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientCardProps {
  client: Client;
  aggregate: ClientAggregate;
}

function formatShortDate(value: string | null) {
  if (!value) return 'Sem registro';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getHealthAccent(client: Client) {
  if (client.status === 'onboarding') return 'border-l-primary';
  if (client.status === 'pausado' || client.status === 'encerrado') return 'border-l-muted-foreground';
  if (client.health_status === 'saudavel') return 'border-l-success';
  if (client.health_status === 'atencao') return 'border-l-warning';
  return 'border-l-destructive';
}

export function ClientCard({ client, aggregate }: ClientCardProps) {
  return (
    <Card
      className={`flex min-h-full flex-col gap-3 border-l-[3px] p-4 transition hover:border-primary/50 hover:bg-card-elevated ${getHealthAccent(client)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{client.company_name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {client.segment ?? client.trade_name ?? 'Sem segmento'}
          </p>
        </div>
        <ClientHealthBadge status={client.health_status} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <ClientStatusBadge status={client.status} />
        <span className="truncate text-xs text-muted-foreground">
          {client.responsible?.name ?? 'Sem responsavel'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-lg border border-border/70 bg-surface/50 px-2 py-2.5 text-center">
        <Stat label="Servicos" value={aggregate.activeServices} />
        <Stat label="Abertas" value={aggregate.openTasks} />
        <Stat label="Vencidas" value={aggregate.overdueTasks} tone={aggregate.overdueTasks > 0 ? 'destructive' : undefined} />
        <Stat
          label="Checklist"
          display={`${aggregate.checklistDone}/${aggregate.checklistTotal}`}
        />
      </div>

      <dl className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <dt>Atualizacao</dt>
          <dd className={aggregate.hasRecentUpdate ? 'font-medium text-foreground' : 'font-medium text-warning'}>
            {formatShortDate(aggregate.lastUpdateDate)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Proxima reuniao</dt>
          <dd className={aggregate.nextMeetingDate ? 'font-medium text-foreground' : 'font-medium text-warning'}>
            {formatShortDate(aggregate.nextMeetingDate)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Documentos (30d)</dt>
          <dd className="font-medium text-foreground">{aggregate.recentDocuments}</dd>
        </div>
      </dl>

      <Link to={`/app/clientes/${client.id}`} className="mt-auto">
        <Button type="button" variant="secondary" className="w-full">Abrir</Button>
      </Link>
    </Card>
  );
}

function Stat({
  label,
  value,
  display,
  tone,
}: {
  label: string;
  value?: number;
  display?: string;
  tone?: 'destructive';
}) {
  return (
    <div className="min-w-0">
      <p className={`text-sm font-bold tabular-nums ${tone === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>
        {display ?? value}
      </p>
      <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
