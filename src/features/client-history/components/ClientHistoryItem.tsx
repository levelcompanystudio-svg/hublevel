import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui';
import type { ClientHistoryEvent, ClientHistoryEventType } from '../client-history.types';
import { clientHistoryEventTypeLabels } from '../client-history.types';

interface ClientHistoryItemProps {
  event: ClientHistoryEvent;
  isLast: boolean;
}

const typeDotClassName: Record<ClientHistoryEventType, string> = {
  task: 'bg-primary',
  update: 'bg-chart-2',
  meeting: 'bg-chart-4',
  document: 'bg-muted-foreground',
  deliverable: 'bg-success',
  landing_page: 'bg-warning',
};

function formatDateTime(value: string): string {
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  const hasTime = value.includes('T') && !value.endsWith('T00:00:00.000Z');
  return hasTime
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
    : new Intl.DateTimeFormat('pt-BR').format(date);
}

export function ClientHistoryItem({ event, isLast }: ClientHistoryItemProps) {
  const content = (
    <div className="flex-1 rounded-lg border border-border bg-card p-4 transition hover:border-primary/40">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{clientHistoryEventTypeLabels[event.type]}</Badge>
        {event.status && <Badge tone="neutral">{event.status}</Badge>}
        <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(event.date)}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{event.title}</p>
      {event.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{event.description}</p>}
      {event.actorName && <p className="mt-2 text-xs text-muted-foreground">Responsavel: {event.actorName}</p>}
    </div>
  );

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden="true" />}
      <span className={`relative mt-4 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-background ${typeDotClassName[event.type]}`} aria-hidden="true" />
      {event.href ? (
        <Link to={event.href} className="flex-1">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
