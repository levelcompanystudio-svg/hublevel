import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import type { ClientAggregate } from '../client-aggregates.types';
import type { Client } from '../clients.types';
import { ClientAvatar } from './ClientAvatar';
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

// Reaproveita os mesmos sinais ja calculados para o modulo de Alertas (sem atualizacao recente,
// sem reuniao recente/agendada, tarefas vencidas), mas exibidos de forma discreta no card em vez
// de uma secao separada — so aparece quando ha algo relevante para o cliente ativo.
function getAlertReasons(client: Client, aggregate: ClientAggregate): string[] {
  if (client.status !== 'ativo') return [];
  const reasons: string[] = [];
  if (!aggregate.hasRecentUpdate) reasons.push('Sem atualizacao recente');
  if (!aggregate.hasRecentOrUpcomingMeeting) reasons.push('Sem reuniao recente/agendada');
  if (aggregate.overdueTasks > 0) reasons.push(`${aggregate.overdueTasks} tarefa(s) vencida(s)`);
  return reasons;
}

export function ClientCard({ client, aggregate }: ClientCardProps) {
  const displayName = client.trade_name || client.company_name;
  const alertReasons = getAlertReasons(client, aggregate);

  return (
    <Card
      className={`flex min-h-full flex-col gap-4 border-l-[3px] p-4 transition hover:border-primary/50 hover:bg-card-elevated ${getHealthAccent(client)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ClientAvatar name={displayName} />
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-foreground">{displayName}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{client.segment ?? 'Sem segmento'}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {alertReasons.length > 0 && (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full border border-warning/40 bg-warning/10 text-warning"
              title={alertReasons.join(' - ')}
              aria-label={`Alertas: ${alertReasons.join(', ')}`}
            >
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
          <ClientHealthBadge status={client.health_status} />
        </div>
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

      <div className="mt-auto flex items-center gap-2">
        <ClientAvatar name={client.responsible?.name ?? '?'} size="sm" />
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {client.responsible?.email ?? 'Sem responsavel vinculado'}
        </p>
        <Link to={`/app/clientes/${client.id}`}>
          <Button type="button" variant="secondary">Abrir</Button>
        </Link>
      </div>
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
