import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { listChecklistItemsByClient } from '../../checklist/checklist.api';
import { ChecklistSummary } from '../../checklist/components/ChecklistSummary';
import { ChecklistTable } from '../../checklist/components/ChecklistTable';
import type { ChecklistItem } from '../../checklist/checklist.types';

interface ClientChecklistTabProps {
  clientId: string;
}

export function ClientChecklistTab({ clientId }: ClientChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listChecklistItemsByClient(clientId);
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar checklist do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState title="Carregando checklist do cliente" />;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-4">
      <ChecklistSummary items={items} />
      <ChecklistTable items={items} />
    </div>
  );
}
