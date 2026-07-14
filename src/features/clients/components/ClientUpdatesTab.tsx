import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Button, Card } from '../../../components/ui';
import { listUpdatesByClient } from '../../updates/updates.api';
import type { Update } from '../../updates/updates.types';
import { UpdateStatusBadge } from '../../updates/components/UpdateStatusBadge';
import { formatDate, responsibleName } from '../../updates/components/UpdateTable';

interface ClientUpdatesTabProps {
  clientId: string;
  canManage: boolean;
}

export function ClientUpdatesTab({ clientId, canManage }: ClientUpdatesTabProps) {
  const [items, setItems] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listUpdatesByClient(clientId);
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atualizacoes do cliente.');
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
          <Link to={`/app/acompanhamento/novo?client_id=${clientId}`}>
            <Button type="button" variant="primary">Nova atualizacao</Button>
          </Link>
        </div>
      )}

      {loading && <LoadingState title="Carregando historico de acompanhamento" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        items.length === 0 ? (
          <EmptyState
            title="Nenhuma atualizacao registrada"
            description="O historico de acompanhamento deste cliente aparecera aqui assim que uma atualizacao for registrada."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <UpdateStatusBadge status={item.status} />
                      {item.sent_to_client && <Badge tone="success">Enviada ao cliente</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(item.update_date)} - {responsibleName(item)}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/app/acompanhamento/${item.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    {canManage && (
                      <Link to={`/app/acompanhamento/${item.id}/editar`}>
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
