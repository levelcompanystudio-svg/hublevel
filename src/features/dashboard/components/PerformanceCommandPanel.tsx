import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PerformancePeriodFilter } from '../../performance/components/PerformancePeriodFilter';
import type { PerformancePeriodRange } from '../../performance/performance-period';
import type { PerformanceOverview } from '../../performance/performance.types';
import { DashboardTrendChart, PRIMARY_METRICS } from './DashboardTrendChart';
import type { PrimaryMetricKey } from './DashboardTrendChart';

interface PerformanceCommandPanelProps {
  overview: PerformanceOverview;
  previousOverview: PerformanceOverview | null;
  loading: boolean;
  error: string | null;
  period: PerformancePeriodRange;
  onPeriodChange: (period: PerformancePeriodRange) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatMultiplier(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(2)}x`;
}

function formatMoneyRatio(value: number | null): string {
  return value === null ? '—' : formatCurrency(value);
}

interface Delta {
  text: string;
  tone: 'success' | 'destructive' | 'neutral';
}

// So calcula delta quando o periodo anterior realmente tem dado real (previous !== null) - nunca
// inventa uma variacao. previous === 0 nao vira percentual (divisao por zero); vira um rotulo
// neutro "novo no periodo".
function computeDelta(current: number, previous: number | null): Delta | null {
  if (previous === null) return null;
  if (previous === 0) {
    if (current === 0) return null;
    return { text: 'Novo no período', tone: 'neutral' };
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct > 0 ? '+' : '';
  return {
    text: `${sign}${pct.toFixed(1)}% vs. período anterior`,
    tone: pct > 0 ? 'success' : pct < 0 ? 'destructive' : 'neutral',
  };
}

// Area B do Dashboard V3 (Performance Principal): faixa compacta de metricas + selecao funcional
// da serie principal do grafico (nunca investimento/cliques/leads sobrepostos na mesma escala).
// Comparacao com periodo anterior usa uma segunda chamada real a getPortfolioPerformanceOverview
// (ResultsDashboard.tsx), nunca uma variacao inventada.
export function PerformanceCommandPanel({ overview, previousOverview, loading, error, period, onPeriodChange }: PerformanceCommandPanelProps) {
  const { totals, hasData, dailySeries } = overview;
  const [metric, setMetric] = useState<PrimaryMetricKey>('spend');
  const [compareEnabled, setCompareEnabled] = useState(false);

  const previousHasData = previousOverview?.hasData ?? false;
  const previousTotals = previousHasData ? previousOverview!.totals : null;
  const canCompare = previousHasData && previousOverview!.dailySeries.length > 0;

  return (
    <section className="rounded-2xl border border-border bg-card-elevated">
      <div className="p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              <p className="text-caption uppercase tracking-wide text-muted-foreground">Performance — dados reais</p>
            </div>
            <h2 className="mt-1 text-h2 text-foreground">Investimento e resultados de campanhas</h2>
          </div>
          <Link to="/app/performance" className="shrink-0 text-xs font-medium text-muted-foreground hover:text-primary hover:underline">
            Ver detalhes
          </Link>
        </div>

        <div className="mt-4">
          <PerformancePeriodFilter value={period} onChange={onPeriodChange} />
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando performance...</p>
        ) : error ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 py-16 text-center">
            <p className="text-sm font-semibold text-destructive">Não foi possível carregar a performance.</p>
            <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
          </div>
        ) : !hasData ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhuma métrica sincronizada ainda.</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Conecte Meta Ads em um cliente (aba Integrações) para ver investimento, leads e ROAS aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
              <MetricTile
                label="Investimento"
                value={formatCurrency(totals.investment)}
                delta={computeDelta(totals.investment, previousTotals?.investment ?? null)}
              />
              <MetricTile
                label="Cliques"
                value={formatCount(totals.clicks)}
                delta={computeDelta(totals.clicks, previousTotals?.clicks ?? null)}
              />
              <MetricTile
                label="Leads"
                value={formatCount(totals.leads)}
                delta={totals.leads === 0 ? null : computeDelta(totals.leads, previousTotals?.leads ?? null)}
                context={totals.leads === 0 ? 'Nenhuma conversão registrada' : undefined}
              />
              <MetricTile label="CPL" value={formatMoneyRatio(totals.cpl)} context={totals.cpl === null ? 'Sem base de cálculo' : undefined} />
              <MetricTile
                label="ROAS"
                value={formatMultiplier(totals.roas)}
                context={totals.roas === null ? 'Sem base de cálculo' : undefined}
                tone={totals.roas !== null && totals.roas >= 1 ? 'success' : undefined}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <div className="flex flex-wrap gap-1.5">
                {PRIMARY_METRICS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setMetric(option.key)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      metric === option.key
                        ? 'border-primary/60 bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: metric === option.key ? 'currentColor' : option.color }}
                      aria-hidden="true"
                    />
                    {option.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!canCompare}
                onClick={() => setCompareEnabled((value) => !value)}
                title={canCompare ? undefined : 'Sem dados no período anterior para comparar'}
                className={`flex items-center gap-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  compareEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${compareEnabled ? 'border-primary bg-primary' : 'border-border'}`}>
                  {compareEnabled && <span className="h-1.5 w-1.5 rounded-sm bg-primary-foreground" />}
                </span>
                Comparar com período anterior
              </button>
            </div>

            <div className="mt-4">
              <DashboardTrendChart
                metric={metric}
                data={dailySeries}
                previousData={canCompare ? previousOverview!.dailySeries : null}
                compareEnabled={compareEnabled && canCompare}
                height={240}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  delta,
  context,
  tone,
}: {
  label: string;
  value: string;
  delta?: Delta | null;
  context?: string;
  tone?: 'success';
}) {
  return (
    <div className="min-w-0">
      <p className="text-caption uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${tone === 'success' ? 'text-success' : 'text-foreground'}`}>{value}</p>
      {delta ? (
        <p
          className={`mt-0.5 truncate text-[11px] font-medium ${
            delta.tone === 'success' ? 'text-success' : delta.tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {delta.text}
        </p>
      ) : context ? (
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{context}</p>
      ) : null}
    </div>
  );
}
