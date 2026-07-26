import { StatsGrid } from '../../../components/layout/StatsGrid';
import type { PerformanceOverview } from '../performance.types';
import { PerformanceMetricCard } from './PerformanceMetricCard';

interface PerformanceSummaryGridProps {
  overview: PerformanceOverview;
  variant?: 'full' | 'compact' | 'dashboard';
}

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

// Metricas aditivas (investment/impressions/reach/clicks/leads/conversions/conversionValue) sao
// sempre numeros quando hasData=true (0 real e permitido). Metricas derivadas (ctr/cpc/cpm/cpl/
// roas) podem ser null mesmo com hasData=true, quando o denominador e zero - nesse caso mostramos
// "-" (sem base de calculo), nunca "Sem dados" (que fica reservado para hasData=false).
export function PerformanceSummaryGrid({ overview, variant = 'full' }: PerformanceSummaryGridProps) {
  const { totals, hasData } = overview;
  const additive = (value: number) => (hasData ? value : null);
  const ratioProps = (value: number | null) =>
    hasData
      ? { value, emptyLabel: '-', emptyHint: 'Sem base de calculo no periodo' }
      : { value: null };

  if (variant === 'compact') {
    return (
      <StatsGrid className="sm:grid-cols-2 xl:grid-cols-4">
        <PerformanceMetricCard label="Investimento" value={additive(totals.investment)} format={formatCurrency} />
        <PerformanceMetricCard label="Cliques" value={additive(totals.clicks)} format={formatCount} />
        <PerformanceMetricCard label="Leads" value={additive(totals.leads)} format={formatCount} />
        <PerformanceMetricCard label="CPL" {...ratioProps(totals.cpl)} format={formatCurrency} />
      </StatsGrid>
    );
  }

  if (variant === 'dashboard') {
    return (
      <StatsGrid className="sm:grid-cols-2 xl:grid-cols-6">
        <PerformanceMetricCard label="Investimento" value={additive(totals.investment)} format={formatCurrency} />
        <PerformanceMetricCard label="Impressoes" value={additive(totals.impressions)} format={formatCount} />
        <PerformanceMetricCard label="Cliques" value={additive(totals.clicks)} format={formatCount} />
        <PerformanceMetricCard label="Leads" value={additive(totals.leads)} format={formatCount} />
        <PerformanceMetricCard label="CPL" {...ratioProps(totals.cpl)} format={formatCurrency} />
        <PerformanceMetricCard label="ROAS" {...ratioProps(totals.roas)} format={formatMultiplier} />
      </StatsGrid>
    );
  }

  return (
    <StatsGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <PerformanceMetricCard label="Investimento" value={additive(totals.investment)} format={formatCurrency} />
      <PerformanceMetricCard label="Impressoes" value={additive(totals.impressions)} format={formatCount} />
      <PerformanceMetricCard label="Alcance" value={additive(totals.reach)} format={formatCount} />
      <PerformanceMetricCard label="Cliques" value={additive(totals.clicks)} format={formatCount} />
      <PerformanceMetricCard label="CTR" {...ratioProps(totals.ctr)} format={formatPercent} />
      <PerformanceMetricCard label="CPC" {...ratioProps(totals.cpc)} format={formatCurrency} />
      <PerformanceMetricCard label="CPM" {...ratioProps(totals.cpm)} format={formatCurrency} />
      <PerformanceMetricCard label="Leads" value={additive(totals.leads)} format={formatCount} />
      <PerformanceMetricCard label="CPL" {...ratioProps(totals.cpl)} format={formatCurrency} />
      <PerformanceMetricCard label="Conversoes" value={additive(totals.conversions)} format={formatCount} />
      <PerformanceMetricCard label="Valor de conversao" value={additive(totals.conversionValue)} format={formatCurrency} />
      <PerformanceMetricCard label="ROAS" {...ratioProps(totals.roas)} format={formatMultiplier} />
    </StatsGrid>
  );
}
