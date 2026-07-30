import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { PerformanceDailyPoint } from '../../performance/performance.types';

type SeriesKey = 'spend' | 'clicks' | 'leads';

interface Series {
  key: SeriesKey;
  label: string;
  color: string;
}

const SERIES: Series[] = [
  { key: 'spend', label: 'Investimento', color: 'var(--chart-1)' },
  { key: 'clicks', label: 'Cliques', color: 'var(--chart-2)' },
  { key: 'leads', label: 'Leads', color: 'var(--chart-3)' },
];

interface DashboardTrendChartProps {
  data: PerformanceDailyPoint[];
  height?: number;
}

interface Geometry {
  linePath: string;
  areaPath: string;
  points: Array<{ x: number; y: number }>;
  last: { x: number; y: number };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatSeriesValue(key: SeriesKey, value: number): string {
  return key === 'spend' ? formatCurrency(value) : formatCount(value);
}

// Catmull-Rom -> Bezier: cada segmento usa os pontos vizinhos para calcular pontos de controle,
// produzindo uma curva suave que ainda passa exatamente por todos os pontos originais (sem
// distorcer os valores reais, so a forma como o traco entre eles e desenhado).
function buildSmoothLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return path;
}

function buildGeometry(values: number[], width: number, height: number, padding: number): Geometry {
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = padding + index * stepX;
    const normalized = (value - min) / range;
    const y = height - padding - normalized * (height - padding * 2);
    return { x, y };
  });

  const linePath = buildSmoothLinePath(points);
  const baseline = height - padding;
  const areaPath = points.length
    ? `${linePath} L${points[points.length - 1].x.toFixed(2)},${baseline} L${points[0].x.toFixed(2)},${baseline} Z`
    : '';

  return { linePath, areaPath, points, last: points[points.length - 1] ?? { x: 0, y: 0 } };
}

function formatDateShort(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// Grafico dedicado ao painel de performance do Dashboard V3: preenchimento em gradiente, grade de
// fundo discreta e enfase no ultimo ponto de cada serie, para o grafico parecer parte da
// superficie analitica em vez de um SVG generico dentro de um card. Nao reaproveita
// PerformanceTrendChart (usado em /app/performance e nas abas de cliente) para nao alterar o
// visual dessas telas, fora do escopo desta missao.
//
// Interatividade (hover/touch): um <rect> transparente sobre a area do grafico captura pointer
// events e converte a posicao do cursor (client space) para o espaco do viewBox, resolvendo o
// indice do dia mais proximo pelo mesmo stepX/padding usados em buildGeometry - assim o crosshair,
// os marcadores por serie e o tooltip HTML ficam sempre alinhados aos pontos reais da curva.
export function DashboardTrendChart({ data, height = 280 }: DashboardTrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 720;
  const padding = 24;
  const gridLines = 4;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const seriesGeometry = SERIES.map((series) => ({
    series,
    geometry: buildGeometry(
      data.map((point) => point[series.key]),
      width,
      height,
      padding,
    ),
  }));

  function updateHoveredIndex(event: ReactPointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const xInViewBox = ((event.clientX - rect.left) / rect.width) * width;
    const index = stepX > 0 ? Math.round((xInViewBox - padding) / stepX) : 0;
    setHoveredIndex(Math.min(Math.max(index, 0), data.length - 1));
  }

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredX = hoveredIndex !== null ? padding + hoveredIndex * stepX : null;
  const hoveredPercent = hoveredX !== null ? Math.min(Math.max((hoveredX / width) * 100, 8), 92) : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Grafico de tendencia diaria de performance"
      >
        <defs>
          {SERIES.map((series) => (
            <linearGradient key={series.key} id={`dash-trend-fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.color} stopOpacity="0.24" />
              <stop offset="100%" stopColor={series.color} stopOpacity="0" />
            </linearGradient>
            ))}
        </defs>

        {Array.from({ length: gridLines }).map((_, index) => {
          const y = padding + ((height - padding * 2) / (gridLines - 1)) * index;
          return (
            <line
              key={index}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={index === gridLines - 1 ? undefined : '2 6'}
              opacity={index === gridLines - 1 ? 0.9 : 0.4}
            />
          );
        })}

        {hoveredX !== null && (
          <line
            x1={hoveredX}
            y1={padding}
            x2={hoveredX}
            y2={height - padding}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.5"
          />
        )}

        {seriesGeometry.map(({ series, geometry }) => (
          <g key={series.key}>
            <path d={geometry.areaPath} fill={`url(#dash-trend-fill-${series.key})`} stroke="none" />
            <path
              d={geometry.linePath}
              fill="none"
              stroke={series.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={geometry.last.x} cy={geometry.last.y} r="7" fill={series.color} opacity="0.18" />
            <circle cx={geometry.last.x} cy={geometry.last.y} r="3" fill={series.color} stroke="var(--card-elevated)" strokeWidth="1.5" />
            {hoveredIndex !== null && geometry.points[hoveredIndex] && (
              <circle
                cx={geometry.points[hoveredIndex].x}
                cy={geometry.points[hoveredIndex].y}
                r="4"
                fill={series.color}
                stroke="var(--card-elevated)"
                strokeWidth="1.5"
              />
            )}
          </g>
        ))}

        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          onPointerMove={updateHoveredIndex}
          onPointerLeave={() => setHoveredIndex(null)}
          className="cursor-crosshair"
        />
      </svg>

      {hovered && hoveredPercent !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[132px] -translate-x-1/2 rounded-lg border border-border bg-card-elevated px-3 py-2 shadow-soft"
          style={{ left: `${hoveredPercent}%` }}
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {formatDateShort(hovered.date)}
          </p>
          <div className="mt-1.5 space-y-1">
            {SERIES.map((series) => (
              <div key={series.key} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
                  {series.label}
                </span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {formatSeriesValue(series.key, hovered[series.key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-1 flex justify-between font-mono text-[11px] tracking-tight text-muted-foreground">
        <span>{formatDateShort(data[0].date)}</span>
        <span>{formatDateShort(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

export { SERIES as DASHBOARD_TREND_SERIES };
