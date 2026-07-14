import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { listMeetingsByClient } from '../../meetings/meetings.api';
import type { Meeting } from '../../meetings/meetings.types';
import { MeetingStatusBadge } from '../../meetings/components/MeetingStatusBadge';
import { MeetingTypeBadge } from '../../meetings/components/MeetingTypeBadge';
import { creatorName, formatDateTime } from '../../meetings/components/MeetingTable';

interface ClientMeetingsTabProps {
  clientId: string;
  canManage: boolean;
}

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

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Link to={`/app/reunioes/novo?client_id=${clientId}`}>
            <Button type="button" variant="primary">Nova reuniao</Button>
          </Link>
        </div>
      )}

      {loading && <LoadingState title="Carregando reunioes do cliente" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        items.length === 0 ? (
          <EmptyState
            title="Nenhuma reuniao registrada"
            description="O historico de reunioes deste cliente aparecera aqui assim que uma reuniao for registrada."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <MeetingStatusBadge status={item.status} />
                      <MeetingTypeBadge type={item.type} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(item.scheduled_at)} - Criado por {creatorName(item)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/app/reunioes/${item.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    {canManage && (
                      <Link to={`/app/reunioes/${item.id}/editar`}>
                        <Button type="button" variant="secondary">Editar</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
