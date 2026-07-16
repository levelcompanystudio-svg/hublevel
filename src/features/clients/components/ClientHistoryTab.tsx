import { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { listClientHistory } from '../../client-history/client-history.api';
import { ClientHistoryFilters } from '../../client-history/components/ClientHistoryFilters';
import type { ClientHistoryFilter } from '../../client-history/components/ClientHistoryFilters';
import { ClientHistoryTimeline } from '../../client-history/components/ClientHistoryTimeline';
import type { ClientHistoryEvent } from '../../client-history/client-history.types';

interface ClientHistoryTabProps {
  clientId: string;
}

export function ClientHistoryTab({ clientId }: ClientHistoryTabProps) {
  const [events, setEvents] = useState<ClientHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ClientHistoryFilter>('todos');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listClientHistory(clientId);
      setEvents(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar historico do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const base: Record<ClientHistoryFilter, number> = {
      todos: events.length,
      task: 0,
      update: 0,
      meeting: 0,
      document: 0,
      deliverable: 0,
      landing_page: 0,
    };
    for (const event of events) {
      base[event.type] += 1;
    }
    return base;
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === 'todos') return events;
    return events.filter((event) => event.type === filter);
  }, [events, filter]);

  if (loading) return <LoadingState title="Carregando historico do cliente" />;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-4">
      <ClientHistoryFilters active={filter} counts={counts} onChange={setFilter} />
      <ClientHistoryTimeline events={filteredEvents} />
    </div>
  );
}
