import type { ClientPerformanceMetrics } from '../performance.types';
import { PerformanceMetricCard } from './PerformanceMetricCard';

interface PerformanceMetricsGridProps {
  metrics: ClientPerformanceMetrics;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function PerformanceMetricsGrid({ metrics }: PerformanceMetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <PerformanceMetricCard label="Investimento" value={metrics.investment} format={formatCurrency} />
      <PerformanceMetricCard label="Leads" value={metrics.leads} format={formatCount} />
      <PerformanceMetricCard label="CPL" value={metrics.cpl} format={formatCurrency} />
      <PerformanceMetricCard label="ROAS" value={metrics.roas} format={formatMultiplier} />
      <PerformanceMetricCard label="Cliques" value={metrics.clicks} format={formatCount} />
    </div>
  );
}
