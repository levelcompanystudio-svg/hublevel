import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Card } from '../../../components/ui';
import { getClientPerformanceMetrics } from '../../performance/performance.api';
import { PerformanceMetricsGrid } from '../../performance/components/PerformanceMetricsGrid';
import type { ClientPerformanceMetrics } from '../../performance/performance.types';

interface ClientMetricsTabProps {
  clientId: string;
}

export function ClientMetricsTab({ clientId }: ClientMetricsTabProps) {
  const [metrics, setMetrics] = useState<ClientPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getClientPerformanceMetrics(clientId);
      setMetrics(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar metricas do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState title="Carregando metricas de performance" />;
  if (error) return <ErrorState description={error} />;
  if (!metrics) return null;

  const hasAnyData = Object.values(metrics).some((value) => value !== null);

  return (
    <div className="space-y-4">
      <PerformanceMetricsGrid metrics={metrics} />
      {!hasAnyData && (
        <Card>
          <EmptyState
            title="Sem dados de performance conectados"
            description="Este espaco esta pronto para receber integracoes futuras (Meta Ads, Google Ads, pesquisas de NPS). Quando uma fonte de dados real for conectada, os cards acima passam a exibir os numeros deste cliente automaticamente."
          />
        </Card>
      )}
    </div>
  );
}
