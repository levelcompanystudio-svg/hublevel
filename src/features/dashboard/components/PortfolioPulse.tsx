interface PulseGroup {
  key: string;
  label: string;
  count: number;
  barClassName: string;
  dotClassName: string;
  textClassName: string;
}

interface PortfolioPulseProps {
  groups: PulseGroup[];
  total: number;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Area D do Dashboard V3 (Carteira): anel de status (pulse real) em vez de card com barra e
// porcentagem. O anel usa a mesma logica de "camada sobre track" do grafico de performance -
// preenchimento proporcional, nao decoracao solta.
export function PortfolioPulse({ groups, total }: PortfolioPulseProps) {
  const healthy = groups.find((group) => group.key === 'saudavel');
  const healthyPercent = total > 0 && healthy ? Math.round((healthy.count / total) * 100) : null;
  const dashOffset = healthyPercent === null ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - healthyPercent / 100);
  const isFullyHealthy = healthyPercent !== null && healthyPercent >= 90;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card-elevated p-5">
      <div className="flex items-center gap-2">
        <p className="text-caption uppercase tracking-wide text-muted-foreground">Carteira</p>
        {isFullyHealthy && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-1 items-center gap-5">
        <div className="relative shrink-0">
          <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
            <circle cx="52" cy="52" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="9" />
            {healthyPercent !== null && (
              <circle
                cx="52"
                cy="52"
                r={RADIUS}
                fill="none"
                stroke="var(--success)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground">{healthyPercent ?? '-'}%</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">saudavel</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="text-xs text-muted-foreground">{total} clientes operacionais</p>
          {groups.map((group) => (
            <div key={group.key} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${group.dotClassName}`} aria-hidden="true" />
                <p className="truncate text-xs text-muted-foreground">{group.label}</p>
              </div>
              <p className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${group.textClassName}`}>{group.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
