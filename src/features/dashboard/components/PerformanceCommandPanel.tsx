import { Link } from 'react-router-dom';
import { PerformancePeriodFilter } from '../../performance/components/PerformancePeriodFilter';
import type { PerformancePeriodRange } from '../../performance/performance-period';
import type { PerformanceOverview } from '../../performance/performance.types';
import { DashboardTrendChart } from './DashboardTrendChart';

interface PerformanceCommandPanelProps {
  overview: PerformanceOverview;
  loading: boolean;
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
  return value === null ? '-' : `${value.toFixed(2)}x`;
}

function formatMoneyRatio(value: number | null): string {
  return value === null ? '-' : formatCurrency(value);
}

// Area B do Dashboard V3 (Performance Principal): superficie analitica propria, nao um Card
// generico com grafico dentro. Fundo em camadas (glow ancorado + grade do grafico embutida),
// numero herói com acento lateral, cluster de metricas com a mesma paleta categorica do grafico
// (chart-1/2/3) para o cluster e o grafico lerem como uma unica peca, nao dois elementos soltos.
export function PerformanceCommandPanel({ overview, loading, period, onPeriodChange }: PerformanceCommandPanelProps) {
  const { totals, hasData, dailySeries } = overview;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card-elevated shadow-soft">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(640px circle at 0% 0%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 62%)',
        }}
        aria-hidden="true"
      />

      <div className="relative p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <p className="text-caption uppercase tracking-wide text-muted-foreground">Performance - dados reais</p>
            </div>
            <h2 className="mt-1 text-h2 text-foreground">Investimento e resultados de campanhas</h2>
          </div>
          <Link to="/app/performance" className="shrink-0 text-xs font-semibold text-primary hover:underline">
            Ver detalhes
          </Link>
        </div>

        <div className="mt-4">
          <PerformancePeriodFilter value={period} onChange={onPeriodChange} />
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando performance...</p>
        ) : !hasData ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-surface/40 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhuma metrica sincronizada ainda.</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Conecte Meta Ads em um cliente (aba Integracoes) para ver investimento, leads e ROAS aqui.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-x-8">
              <div className="shrink-0 border-l-2 border-l-primary/60 pl-4">
                <p className="text-caption uppercase text-muted-foreground">Investimento</p>
                <p className="text-metric-hero mt-1 font-mono tabular-nums text-foreground">{formatCurrency(totals.investment)}</p>
              </div>
              <div className="flex flex-1 flex-wrap items-stretch gap-x-7 gap-y-3 border-t border-border/70 pt-4 sm:border-t-0 sm:border-l sm:border-border/70 sm:pl-7 sm:pt-0">
                <MetricStat label="Cliques" value={formatCount(totals.clicks)} dotColor="var(--chart-2)" />
                <MetricStat label="Leads" value={formatCount(totals.leads)} dotColor="var(--chart-3)" />
                <MetricStat label="CPL" value={formatMoneyRatio(totals.cpl)} />
                <MetricStat label="ROAS" value={formatMultiplier(totals.roas)} tone={totals.roas !== null && totals.roas >= 1 ? 'success' : undefined} />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border/60 bg-background/30 p-4">
              <div className="flex flex-wrap items-center gap-4 pb-3">
                {[
                  { label: 'Investimento', color: 'var(--chart-1)' },
                  { label: 'Cliques', color: 'var(--chart-2)' },
                  { label: 'Leads', color: 'var(--chart-3)' },
                ].map((series) => (
                  <div key={series.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
                    {series.label}
                  </div>
                ))}
              </div>
              <DashboardTrendChart data={dailySeries} height={260} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function MetricStat({ label, value, tone, dotColor }: { label: string; value: string; tone?: 'success'; dotColor?: string }) {
  return (
    <div className="min-w-[64px]">
      <div className="flex items-center gap-1.5">
        {dotColor && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden="true" />}
        <p className="text-caption uppercase text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${tone === 'success' ? 'text-success' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
