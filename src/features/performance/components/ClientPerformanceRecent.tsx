import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui';
import { getClientPerformanceOverview } from '../performance.api';
import { getDefaultPerformancePeriod, formatPerformancePeriodLabel } from '../performance-period';
import type { PerformanceOverview } from '../performance.types';
import { emptyPerformanceOverview } from '../performance.types';
import { PerformanceSummaryGrid } from './PerformanceSummaryGrid';
import { PerformanceTrendChart } from './PerformanceTrendChart';

interface ClientPerformanceRecentProps {
  clientId: string;
}

export function ClientPerformanceRecent({ clientId }: ClientPerformanceRecentProps) {
  const [overview, setOverview] = useState<PerformanceOverview>(emptyPerformanceOverview);
  const [loading, setLoading] = useState(true);
  const period = getDefaultPerformancePeriod();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getClientPerformanceOverview(clientId, period)
      .then((data) => {
        if (active) setOverview(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <h3 className="text-sm font-semibold text-foreground">Performance recente</h3>
        <span className="text-xs text-muted-foreground">{formatPerformancePeriodLabel(period)}</span>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : !overview.hasData ? (
        <p className="text-sm text-muted-foreground">Nenhuma métrica sincronizada ainda.</p>
      ) : (
        <div className="space-y-4">
          <PerformanceSummaryGrid overview={overview} variant="compact" />
          <PerformanceTrendChart data={overview.dailySeries} height={140} />
        </div>
      )}
    </Card>
  );
}
