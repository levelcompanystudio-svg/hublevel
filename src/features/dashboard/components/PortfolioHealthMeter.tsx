interface HealthMeterGroup {
  key: string;
  label: string;
  count: number;
  barClassName: string;
  dotClassName: string;
}

interface PortfolioHealthMeterProps {
  groups: HealthMeterGroup[];
  total: number;
}

// Uma barra unica dividida por proporcao, em vez de N barras de progresso empilhadas: mesma
// informacao (saude da carteira por status), leitura mais visual e rapida.
export function PortfolioHealthMeter({ groups, total }: PortfolioHealthMeterProps) {
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {total === 0 ? (
          <div className="h-full w-full" />
        ) : (
          groups.map((group) => {
            const percent = (group.count / total) * 100;
            if (percent <= 0) return null;
            return (
              <div
                key={group.key}
                className={`h-full ${group.barClassName}`}
                style={{ width: `${percent}%` }}
                title={`${group.label}: ${group.count}`}
              />
            );
          })
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {groups.map((group) => {
          const percent = total > 0 ? Math.round((group.count / total) * 100) : 0;
          return (
            <div key={group.key} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${group.dotClassName}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{group.label}</p>
                <p className="text-xs text-muted-foreground">{group.count} - {percent}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
