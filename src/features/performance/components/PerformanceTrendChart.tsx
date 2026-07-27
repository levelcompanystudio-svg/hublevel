import type { PerformanceDailyPoint } from '../performance.types';

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

interface PerformanceTrendChartProps {
  data: PerformanceDailyPoint[];
  height?: number;
}

// Cada serie e normalizada dentro do proprio min/max (0-1) antes de virar coordenadas Y - assim
// investimento (R$), cliques e leads (contagens, escalas bem diferentes) ficam visualmente
// comparaveis no mesmo grafico. Os valores reais continuam disponiveis nos cards acima do
// grafico; aqui o objetivo e mostrar a tendencia/formato da curva, nao o valor absoluto.
function buildPath(values: number[], width: number, height: number, padding: number): string {
  if (values.length === 0) return '';

  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = padding + index * stepX;
      const normalized = (value - min) / range;
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function formatDateShort(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function PerformanceTrendChart({ data, height = 220 }: PerformanceTrendChartProps) {
  if (data.length === 0) return null;

  const width = 640;
  const padding = 20;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 pb-3">
        {SERIES.map((series) => (
          <div key={series.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: series.color }} aria-hidden="true" />
            {series.label}
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Grafico de tendencia diaria de performance"
      >
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth="1" />
        {SERIES.map((series) => {
          const values = data.map((point) => point[series.key]);
          const path = buildPath(values, width, height, padding);
          return (
            <path
              key={series.key}
              d={path}
              fill="none"
              stroke={series.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatDateShort(data[0].date)}</span>
        <span>{formatDateShort(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}
