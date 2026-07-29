import { CalendarClock, CheckSquare, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OperationalAlert } from '../../alerts/alerts.types';

interface OperationalRailProps {
  alerts: OperationalAlert[];
  meetingsNext7Days: number;
  openTasks: number;
}

const MAX_ALERTS = 5;

const severityStyles = {
  alta: { bar: 'bg-destructive', tag: 'text-destructive', label: 'ALTA' },
  media: { bar: 'bg-warning', tag: 'text-warning', label: 'MEDIA' },
} as const;

// Area C do Dashboard V3 (Operational Rail): fila operacional densa, nao lista/card generico.
// Cada risco tem um indice, uma barra de severidade e um rotulo mono compacto - lido como fila de
// decisao (estilo Linear), nao como cartao de notificacao.
export function OperationalRail({ alerts, meetingsNext7Days, openTasks }: OperationalRailProps) {
  const topAlerts = alerts.slice(0, MAX_ALERTS);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/40 to-transparent" aria-hidden="true" />

      <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-3.5">
        <div className="flex items-center gap-2">
          <h3 className="text-h3 text-foreground">Fila de atencao</h3>
          {topAlerts.length > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">{alerts.length}</span>
          )}
        </div>
        <Link to="/app/alertas" className="text-xs font-semibold text-primary hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="flex-1 px-2 pb-2">
        {topAlerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum risco identificado no momento.</p>
        ) : (
          <div className="space-y-1">
            {topAlerts.map((alert, index) => {
              const severity = severityStyles[alert.severity];
              return (
                <Link
                  key={alert.id}
                  to={alert.clientId ? `/app/clientes/${alert.clientId}` : '/app/alertas'}
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-lg py-2 pl-3 pr-2.5 transition-colors duration-150 hover:bg-card-elevated"
                >
                  <span className={`absolute inset-y-1 left-0 w-[3px] rounded-full ${severity.bar}`} aria-hidden="true" />
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{alert.clientName ?? alert.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                  <span className={`shrink-0 font-mono text-[10px] font-bold tracking-wide ${severity.tag}`}>{severity.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex divide-x divide-border border-t border-border">
        <Link to="/app/reunioes" className="flex flex-1 items-center gap-2.5 px-4 py-3.5 transition-colors duration-150 hover:bg-card-elevated">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-lg font-semibold leading-none text-foreground">{meetingsNext7Days}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">Reunioes (7d)</p>
          </div>
        </Link>
        <Link to="/app/tarefas" className="flex flex-1 items-center gap-2.5 px-4 py-3.5 transition-colors duration-150 hover:bg-card-elevated">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-lg font-semibold leading-none text-foreground">{openTasks}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">Tarefas abertas</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
