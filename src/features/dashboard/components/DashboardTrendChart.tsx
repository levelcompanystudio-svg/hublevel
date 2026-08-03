import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { PerformanceDailyPoint } from '../../performance/performance.types';

export type PrimaryMetricKey = 'spend' | 'clicks' | 'leads';

interface MetricConfig {
  key: PrimaryMetricKey;
  label: string;
  color: string;
  formatValue: (value: number) => string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

// Config compartilhada entre o seletor de metrica (PerformanceCommandPanel) e o grafico - uma
// unica fonte para cor/label/formatacao de cada serie possivel.
export const PRIMARY_METRICS: MetricConfig[] = [
  { key: 'spend', label: 'Investimento', color: 'var(--chart-1)', formatValue: formatCurrency },
  { key: 'clicks', label: 'Cliques', color: 'var(--chart-2)', formatValue: formatCount },
  { key: 'leads', label: 'Leads', color: 'var(--chart-3)', formatValue: formatCount },
];

const COMPARISON_COLOR = 'var(--muted-foreground)';

interface DashboardTrendChartProps {
  metric: PrimaryMetricKey;
  data: PerformanceDailyPoint[];
  previousData?: PerformanceDailyPoint[] | null;
  compareEnabled: boolean;
  height?: number;
}

interface Point {
  x: number;
  y: number;
}

function formatDateShort(value: string): string {
  const formatted = new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return formatted.replace(' de ', ' ').replace('.', '');
}

function buildLinePath(points: Point[]): string {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function pickTickIndexes(length: number, maxTicks: number): number[] {
  if (length <= maxTicks) return Array.from({ length }, (_, index) => index);
  const step = (length - 1) / (maxTicks - 1);
  const indexes = Array.from({ length: maxTicks }, (_, tick) => Math.round(tick * step));
  return Array.from(new Set(indexes));
}

function niceAxisMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

// Grafico sobrio de uma serie so (a metrica selecionada), com opcao de sobrepor o periodo
// anterior como linha tracejada cinza para comparacao - nunca duas metricas de unidades
// diferentes juntas. Sem curva suavizada, sem preenchimento pesado, sem glow: linha reta fina,
// grid horizontal discreto, eixos com valores reais. Pontos e crosshair aparecem so no hover.
export function DashboardTrendChart({ metric, data, previousData, compareEnabled, height = 240 }: DashboardTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const config = PRIMARY_METRICS.find((entry) => entry.key === metric) ?? PRIMARY_METRICS[0];
  const values = data.map((point) => point[metric]);
  const isAllZero = values.length > 0 && values.every((value) => value === 0);

  if (metric === 'leads' && isAllZero) {
    return (
      <div className="flex h-[180px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-center">
        <p className="text-sm font-medium text-foreground">Nenhum lead registrado neste período.</p>
        <p className="text-xs text-muted-foreground">Investimento e cliques continuam sendo sincronizados normalmente.</p>
      </div>
    );
  }

  if (data.length === 0) return null;

  const width = 720;
  const padLeft = 52;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 8;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const showPrevious = compareEnabled && !!previousData && previousData.length > 0;
  const previousValues = showPrevious ? (previousData as PerformanceDailyPoint[]).map((point) => point[metric]) : [];
  const domainValues = showPrevious ? [...values, ...previousValues] : values;
  const rawMax = Math.max(...domainValues, 0);
  const axisMax = niceAxisMax(rawMax || 1);
  const gridCount = 4;

  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  function toPoints(series: number[]): Point[] {
    return series.map((value, index) => ({
      x: padLeft + index * stepX,
      y: padTop + plotHeight - (value / axisMax) * plotHeight,
    }));
  }

  const currentPoints = toPoints(values);
  const previousPoints = showPrevious ? toPoints(previousValues) : [];

  function updateHoveredIndex(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const xInViewBox = ((event.clientX - rect.left) / rect.width) * width;
    const index = stepX > 0 ? Math.round((xInViewBox - padLeft) / stepX) : 0;
    setHoveredIndex(Math.min(Math.max(index, 0), data.length - 1));
  }

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredPrevPoint = hoveredIndex !== null ? previousData?.[hoveredIndex] ?? null : null;
  const hoveredX = hoveredIndex !== null ? padLeft + hoveredIndex * stepX : null;
  const hoveredPercent = hoveredX !== null ? Math.min(Math.max((hoveredX / width) * 100, 10), 90) : null;
  const hoveredCpc = hoveredPoint && hoveredPoint.clicks > 0 ? hoveredPoint.spend / hoveredPoint.clicks : null;

  const xTickIndexes = pickTickIndexes(data.length, 6);
  const currentLinePath = buildLinePath(currentPoints);
  const previousLinePath = showPrevious ? buildLinePath(previousPoints) : '';
  const baseline = padTop + plotHeight;
  const areaPath = currentPoints.length
    ? `${currentLinePath} L${currentPoints[currentPoints.length - 1].x.toFixed(2)},${baseline} L${currentPoints[0].x.toFixed(2)},${baseline} Z`
    : '';

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Grafico de tendencia diaria - ${config.label}`}
      >
        <defs>
          <linearGradient id="dash-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridCount }).map((_, index) => {
          const ratio = index / (gridCount - 1);
          const y = padTop + plotHeight * (1 - ratio);
          const value = axisMax * ratio;
          return (
            <g key={index}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                opacity={index === 0 ? 0.7 : 0.35}
              />
              <text x={padLeft - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>
                {config.formatValue(value)}
              </text>
            </g>
          );
        })}

        {hoveredX !== null && (
          <line
            x1={hoveredX}
            y1={padTop}
            x2={hoveredX}
            y2={baseline}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity={0.5}
            className="transition-opacity duration-150"
          />
        )}

        {showPrevious && (
          <path d={previousLinePath} fill="none" stroke={COMPARISON_COLOR} strokeWidth="1.5" strokeDasharray="4 3" opacity={0.7} />
        )}

        <path d={areaPath} fill="url(#dash-trend-fill)" stroke="none" />
        <path d={currentLinePath} fill="none" stroke={config.color} strokeWidth="1.75" />

        {hoveredIndex !== null && currentPoints[hoveredIndex] && (
          <circle cx={currentPoints[hoveredIndex].x} cy={currentPoints[hoveredIndex].y} r="3.5" fill={config.color} stroke="var(--card-elevated)" strokeWidth="1.5" />
        )}
        {showPrevious && hoveredIndex !== null && previousPoints[hoveredIndex] && (
          <circle cx={previousPoints[hoveredIndex].x} cy={previousPoints[hoveredIndex].y} r="3" fill={COMPARISON_COLOR} stroke="var(--card-elevated)" strokeWidth="1.5" />
        )}

        <rect
          x={padLeft}
          y={0}
          width={plotWidth}
          height={height}
          fill="transparent"
          onPointerMove={updateHoveredIndex}
          onPointerLeave={() => setHoveredIndex(null)}
          className="cursor-crosshair"
        />
      </svg>

      <div className="mt-1 flex justify-between px-1 font-mono text-[10px] tracking-tight text-muted-foreground" style={{ marginLeft: padLeft, marginRight: padRight }}>
        {xTickIndexes.map((index) => (
          <span key={index}>{formatDateShort(data[index].date)}</span>
        ))}
      </div>

      {hoveredPoint && hoveredPercent !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[152px] -translate-x-1/2 rounded-lg border border-border bg-card-elevated px-3 py-2 shadow-sm"
          style={{ left: `${hoveredPercent}%` }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{formatDateShort(hoveredPoint.date)}</p>
          <div className="mt-1.5 space-y-1">
            <TooltipRow label="Investimento" value={formatCurrencyPrecise(hoveredPoint.spend)} color="var(--chart-1)" />
            <TooltipRow label="Cliques" value={formatCount(hoveredPoint.clicks)} color="var(--chart-2)" />
            <TooltipRow label="Leads" value={formatCount(hoveredPoint.leads)} color="var(--chart-3)" />
            {hoveredCpc !== null && <TooltipRow label="CPC" value={formatCurrencyPrecise(hoveredCpc)} />}
            {showPrevious && hoveredPrevPoint && (
              <div className="mt-1.5 border-t border-border/70 pt-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Período anterior</p>
                <TooltipRow label={config.label} value={config.formatValue(hoveredPrevPoint[metric])} color={COMPARISON_COLOR} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TooltipRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {color && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />}
        {label}
      </span>
      <span className="font-mono font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
