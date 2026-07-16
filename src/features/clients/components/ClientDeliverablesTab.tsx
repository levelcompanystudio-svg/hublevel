import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button } from '../../../components/ui';
import { listDeliverablesByClient } from '../../deliverables/deliverables.api';
import { DeliverableSummary } from '../../deliverables/components/DeliverableSummary';
import { DeliverableTable } from '../../deliverables/components/DeliverableTable';
import type { Deliverable } from '../../deliverables/deliverables.types';

interface ClientDeliverablesTabProps {
  clientId: string;
  canManage: boolean;
}

export function ClientDeliverablesTab({ clientId, canManage }: ClientDeliverablesTabProps) {
  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Consulta ja filtrada por client_id (tabela propria `deliverables`, RLS aplicada).
      const result = await listDeliverablesByClient(clientId);
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar entregaveis do cliente.');
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
          <Link to={`/app/entregaveis/novo?client_id=${clientId}`}>
            <Button type="button" variant="primary">Novo entregavel</Button>
          </Link>
        </div>
      )}

      {loading && <LoadingState title="Carregando entregaveis do cliente" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <DeliverableSummary items={items} />
          <DeliverableTable items={items} canEdit={canManage} />
        </>
      )}
    </div>
  );
}
