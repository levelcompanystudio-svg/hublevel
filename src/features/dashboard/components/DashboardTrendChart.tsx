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
  last: { x: number; y: number };
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

  return { linePath, areaPath, last: points[points.length - 1] ?? { x: 0, y: 0 } };
}

function formatDateShort(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// Grafico dedicado ao painel de performance do Dashboard V3: preenchimento em gradiente, grade de
// fundo discreta e enfase no ultimo ponto de cada serie, para o grafico parecer parte da
// superficie analitica em vez de um SVG generico dentro de um card. Nao reaproveita
// PerformanceTrendChart (usado em /app/performance e nas abas de cliente) para nao alterar o
// visual dessas telas, fora do escopo desta missao.
export function DashboardTrendChart({ data, height = 280 }: DashboardTrendChartProps) {
  if (data.length === 0) return null;

  const width = 720;
  const padding = 24;
  const gridLines = 4;

  return (
    <div className="relative">
      <svg
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

        {SERIES.map((series) => {
          const values = data.map((point) => point[series.key]);
          const geometry = buildGeometry(values, width, height, padding);
          return (
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
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between font-mono text-[11px] tracking-tight text-muted-foreground">
        <span>{formatDateShort(data[0].date)}</span>
        <span>{formatDateShort(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

export { SERIES as DASHBOARD_TREND_SERIES };
