import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { KpiStrip } from '../../../components/layout/KpiStrip';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getPortfolioPerformanceOverview } from '../performance.api';
import { getDefaultPerformancePeriod } from '../performance-period';
import type { PerformancePeriodRange } from '../performance-period';
import type { PerformanceOverview } from '../performance.types';
import { emptyPerformanceOverview } from '../performance.types';
import { PerformanceEmptyState } from '../components/PerformanceEmptyState';
import { PerformancePeriodFilter } from '../components/PerformancePeriodFilter';
import { PerformanceTrendChart } from '../components/PerformanceTrendChart';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function ratio(value: number | null, format: (value: number) => string): string {
  return value === null ? '-' : format(value);
}

export function PerformanceOverviewPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  const [period, setPeriod] = useState<PerformancePeriodRange>(getDefaultPerformancePeriod());
  const [overview, setOverview] = useState<PerformanceOverview>(emptyPerformanceOverview);
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
        const result = await getPortfolioPerformanceOverview(period);
        if (active) setOverview(result);
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
  }, [canAccess, period]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Gestao"
        title="Performance"
        description="Visao consolidada de investimento, impressoes, cliques, leads e resultados de campanhas pagas (Meta Ads real; Google Ads preparado)."
      />

      <Card>
        <PerformancePeriodFilter value={period} onChange={setPeriod} />
      </Card>

      {loading && <LoadingState title="Carregando performance" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        !overview.hasData ? (
          <PerformanceEmptyState title="Nenhuma métrica encontrada para este período." />
        ) : (
          <>
            <KpiStrip
              items={[
                { label: 'Investimento', value: formatCurrency(overview.totals.investment), tone: 'brand' },
                { label: 'Cliques', value: formatCount(overview.totals.clicks), tone: 'neutral' },
                { label: 'Leads', value: formatCount(overview.totals.leads), tone: 'neutral' },
                { label: 'CPL', value: ratio(overview.totals.cpl, formatCurrency), tone: 'neutral' },
                { label: 'ROAS', value: ratio(overview.totals.roas, formatMultiplier), tone: 'success' },
              ]}
            />

            <Card className="border-t-2 border-t-primary/50">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Tendencia diaria</h3>
              <PerformanceTrendChart data={overview.dailySeries} />
            </Card>

            <div>
              <p className="text-caption mb-2 uppercase text-muted-foreground">Metricas complementares</p>
              <KpiStrip
                density="compact"
                items={[
                  { label: 'Impressoes', value: formatCount(overview.totals.impressions) },
                  { label: 'Alcance', value: formatCount(overview.totals.reach) },
                  { label: 'CTR', value: ratio(overview.totals.ctr, formatPercent) },
                  { label: 'CPC', value: ratio(overview.totals.cpc, formatCurrency) },
                  { label: 'CPM', value: ratio(overview.totals.cpm, formatCurrency) },
                  { label: 'Conversoes', value: formatCount(overview.totals.conversions) },
                  { label: 'Valor de conversao', value: formatCurrency(overview.totals.conversionValue) },
                ]}
              />
            </div>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Detalhamento por dia</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2 pr-4">Data</th>
                      <th className="py-2 pr-4">Investimento</th>
                      <th className="py-2 pr-4">Cliques</th>
                      <th className="py-2 pr-4">Leads</th>
                      <th className="py-2 pr-4">CPL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overview.dailySeries.map((point) => (
                      <tr key={point.date}>
                        <td className="py-2 pr-4 text-foreground">{formatDate(point.date)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCurrency(point.spend)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCount(point.clicks)}</td>
                        <td className="py-2 pr-4 text-foreground">{formatCount(point.leads)}</td>
                        <td className="py-2 pr-4 text-foreground">
                          {point.leads > 0 ? formatCurrency(point.spend / point.leads) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )
      )}
    </div>
  );
}
