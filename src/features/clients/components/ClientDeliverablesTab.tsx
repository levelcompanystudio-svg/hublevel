import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { listDeliverablesByClient } from '../../deliverables/deliverables.api';
import { DeliverableSummary } from '../../deliverables/components/DeliverableSummary';
import { DeliverableTable } from '../../deliverables/components/DeliverableTable';
import type { Deliverable } from '../../deliverables/deliverables.types';

interface ClientDeliverablesTabProps {
  clientId: string;
}

export function ClientDeliverablesTab({ clientId }: ClientDeliverablesTabProps) {
  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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

  if (loading) return <LoadingState title="Carregando entregaveis do cliente" />;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-4">
      <DeliverableSummary items={items} />
      <DeliverableTable items={items} />
    </div>
  );
}
