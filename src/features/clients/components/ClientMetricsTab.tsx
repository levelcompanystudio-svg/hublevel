import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Card } from '../../../components/ui';
import { getClientPerformanceOverview } from '../../performance/performance.api';
import { getDefaultPerformancePeriod } from '../../performance/performance-period';
import type { PerformancePeriodRange } from '../../performance/performance-period';
import type { PerformanceOverview } from '../../performance/performance.types';
import { emptyPerformanceOverview } from '../../performance/performance.types';
import { PerformanceEmptyState } from '../../performance/components/PerformanceEmptyState';
import { PerformancePeriodFilter } from '../../performance/components/PerformancePeriodFilter';
import { PerformanceSummaryGrid } from '../../performance/components/PerformanceSummaryGrid';
import { PerformanceTrendChart } from '../../performance/components/PerformanceTrendChart';

interface ClientMetricsTabProps {
  clientId: string;
}

export function ClientMetricsTab({ clientId }: ClientMetricsTabProps) {
  const [period, setPeriod] = useState<PerformancePeriodRange>(getDefaultPerformancePeriod());
  const [overview, setOverview] = useState<PerformanceOverview>(emptyPerformanceOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getClientPerformanceOverview(clientId, period);
      setOverview(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar metricas do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId, period]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <Card>
        <PerformancePeriodFilter value={period} onChange={setPeriod} />
      </Card>

      {loading ? (
        <LoadingState title="Carregando metricas de performance" />
      ) : error ? (
        <ErrorState description={error} />
      ) : !overview.hasData ? (
        <PerformanceEmptyState
          title="Nenhuma métrica encontrada para este período."
          description="Ajuste o periodo selecionado ou conecte uma conta Meta Ads na aba Integracoes deste cliente e sincronize manualmente."
        />
      ) : (
        <div className="space-y-4">
          <PerformanceSummaryGrid overview={overview} variant="full" />
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Tendencia diaria</h3>
            <PerformanceTrendChart data={overview.dailySeries} />
          </Card>
        </div>
      )}
    </div>
  );
}
