import { Card } from '../../../components/ui';
import type { ClientHistoryEvent } from '../client-history.types';
import { ClientHistoryEmptyState } from './ClientHistoryEmptyState';
import { ClientHistoryItem } from './ClientHistoryItem';

interface ClientHistoryTimelineProps {
  events: ClientHistoryEvent[];
}

export function ClientHistoryTimeline({ events }: ClientHistoryTimelineProps) {
  if (events.length === 0) return <ClientHistoryEmptyState />;

  return (
    <Card>
      <ul className="space-y-0">
        {events.map((event, index) => (
          <ClientHistoryItem key={event.id} event={event} isLast={index === events.length - 1} />
        ))}
      </ul>
    </Card>
  );
}
