import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getPortfolioPerformanceMetrics } from '../performance.api';
import type { ClientPerformanceMetrics } from '../performance.types';
import { emptyClientPerformanceMetrics } from '../performance.types';
import { PerformanceHeader } from '../components/PerformanceHeader';
import { PerformanceMetricsGrid } from '../components/PerformanceMetricsGrid';

function hasAnyData(metrics: ClientPerformanceMetrics): boolean {
  return metrics.investment !== null || metrics.leads !== null || metrics.clicks !== null;
}

export function PerformanceOverviewPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  const [metrics, setMetrics] = useState<ClientPerformanceMetrics>(emptyClientPerformanceMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getPortfolioPerformanceMetrics();
        if (active) setMetrics(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar performance.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-5">
      <PerformanceHeader
        title="Performance"
        description="Visao consolidada de investimento, leads e cliques nos ultimos 30 dias (Meta Ads real; Google Ads preparado)."
      />

      {loading && <LoadingState title="Carregando performance" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <>
          <PerformanceMetricsGrid metrics={metrics} />

          {!hasAnyData(metrics) && (
            <Card>
              <h3 className="text-sm font-semibold text-foreground">Nenhuma metrica sincronizada ainda</h3>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Conecte uma conta Meta Ads na aba Integracoes de um cliente e sincronize manualmente para ver
                investimento, leads, CPL, ROAS e cliques aqui. Google Ads segue preparado na arquitetura, sem
                integracao real ainda.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
