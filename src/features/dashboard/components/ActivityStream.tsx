import { Activity, CalendarDays, CheckSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ActivityItem, ActivityType } from '../dashboard-activity.api';

interface ActivityStreamProps {
  items: ActivityItem[];
}

const ACTIVITY_ICONS: Record<ActivityType, typeof CheckSquare> = {
  tarefa: CheckSquare,
  atualizacao: Activity,
  reuniao: CalendarDays,
  documento: FileText,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  atualizacao: 'var(--chart-1)',
  tarefa: 'var(--chart-2)',
  reuniao: 'var(--chart-3)',
  documento: 'var(--chart-4)',
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatDayLabel(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

// Area E do Dashboard V3 (Activity Stream): timeline real com linha de conexao e marcadores
// coloridos por tipo (mesma paleta categorica do grafico de performance), agrupada por dia -
// aproxima de um feed de atividade (Attio) em vez de uma lista generica de linhas.
export function ActivityStream({ items }: ActivityStreamProps) {
  let lastDay: string | null = null;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-h3 text-foreground">Atividade recente</h3>

      <div className="mt-3 flex-1">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
        ) : (
          <div className="relative">
            <div className="absolute bottom-2 left-[13px] top-2 w-px bg-border" aria-hidden="true" />
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];
                const color = ACTIVITY_COLORS[item.type];
                const dayLabel = formatDayLabel(item.createdAt);
                const showDayLabel = dayLabel !== lastDay;
                lastDay = dayLabel;

                return (
                  <div key={item.id}>
                    {showDayLabel && (
                      <p className="relative z-10 ml-[30px] pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 first:pt-0">
                        {dayLabel}
                      </p>
                    )}
                    <Link
                      to={item.href}
                      className="group relative flex items-start gap-3 rounded-lg py-1.5 pr-2 transition-colors duration-150 hover:bg-card-elevated"
                    >
                      <span
                        className="relative z-10 mt-0.5 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border-2 border-surface bg-card-elevated"
                        style={{ color }}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 pt-1">
                        <p className="truncate text-sm text-foreground">{item.title}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.clientName ?? 'Interno'}</p>
                      </div>
                      <span className="shrink-0 pt-1 font-mono text-[11px] text-muted-foreground/70">{formatTime(item.createdAt)}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
