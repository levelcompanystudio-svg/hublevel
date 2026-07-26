import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { listMeetingsByClient } from '../../meetings/meetings.api';
import type { Meeting } from '../../meetings/meetings.types';
import { MeetingStatusBadge } from '../../meetings/components/MeetingStatusBadge';
import { formatDateTime } from '../../meetings/components/MeetingTable';

interface ClientMeetingsTabProps {
  clientId: string;
  canManage: boolean;
}

const RECENT_HISTORY_LIMIT = 5;

// Resumo apenas: a operacao principal de reunioes (agendar, marcar realizada, cadencia esperada
// por cliente) vive em /app/reunioes. Este tab so mostra o retrato atual deste cliente.
export function ClientMeetingsTab({ clientId, canManage }: ClientMeetingsTabProps) {
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listMeetingsByClient(clientId);
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reunioes do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nowIso = new Date().toISOString();
  const lastMeeting = items.find((item) => item.status === 'realizada') ?? null;
  const nextMeeting = items
    .filter((item) => (item.status === 'agendada' || item.status === 'remarcada') && item.scheduled_at >= nowIso)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0] ?? null;
  const recentHistory = items.slice(0, RECENT_HISTORY_LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/app/reunioes">
          <Button type="button" variant="secondary" size="sm">
            {canManage ? 'Gerenciar na operacao de reunioes' : 'Ver operacao de reunioes'}
          </Button>
        </Link>
      </div>

      {loading && <LoadingState title="Carregando reunioes do cliente" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-caption uppercase tracking-wide">Ultima reuniao</p>
              {lastMeeting ? (
                <>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">{formatDateTime(lastMeeting.scheduled_at)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{lastMeeting.title}</p>
                </>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">Sem registro</p>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-caption uppercase tracking-wide">Proxima reuniao</p>
              {nextMeeting ? (
                <>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">{formatDateTime(nextMeeting.scheduled_at)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{nextMeeting.title}</p>
                </>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">Sem agendamento</p>
              )}
            </Card>
          </div>

          {recentHistory.length === 0 ? (
            <EmptyState
              title="Nenhuma reuniao registrada"
              description="O historico de reunioes deste cliente aparecera aqui assim que uma reuniao for registrada."
            />
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="divide-y divide-border">
                {recentHistory.map((item) => (
                  <Link
                    key={item.id}
                    to={`/app/reunioes/${item.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-card-elevated"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(item.scheduled_at)}</p>
                    </div>
                    <MeetingStatusBadge status={item.status} />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
