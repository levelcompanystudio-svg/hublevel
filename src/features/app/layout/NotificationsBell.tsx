import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnClickOutside } from '../../../lib/useOnClickOutside';
import { getOperationalAlerts } from '../../alerts/alerts.api';
import type { AlertType, OperationalAlert } from '../../alerts/alerts.types';
import { AlertPriorityBadge } from '../../alerts/components/AlertPriorityBadge';
import type { RoleName } from '../../auth/auth.types';

interface NotificationsBellProps {
  role?: RoleName;
}

const typeLabels: Record<AlertType, string> = {
  cliente_sem_atualizacao: 'Sem atualizacao',
  cliente_sem_reuniao: 'Sem reuniao',
  tarefa_vencida: 'Tarefa vencida',
  financeiro_atrasado: 'Financeiro atrasado',
};

const MAX_VISIBLE = 6;

export function NotificationsBell({ role }: NotificationsBellProps) {
  const canView = role === 'admin' || role === 'gestor';
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (!canView) return;

    let active = true;

    async function load() {
      try {
        setLoading(true);
        const result = await getOperationalAlerts(role as RoleName);
        if (active) setAlerts(result);
      } catch {
        if (active) setAlerts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [canView, role]);

  if (!canView) return null;

  return (
    <div ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notificacoes"
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <Bell className="h-3.5 w-3.5" aria-hidden="true" />
        {alerts.length > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold leading-none text-destructive-foreground">
            {alerts.length > 9 ? '9+' : alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-x-2.5 bottom-full z-40 mb-2 rounded-xl border border-border bg-card p-2 shadow-soft"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-h3 text-foreground">Notificacoes</p>
            {alerts.length > 0 && <span className="text-caption">{alerts.length} no total</span>}
          </div>

          {loading ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">Carregando...</p>
          ) : alerts.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">Nenhum alerta no momento.</p>
          ) : (
            <div className="max-h-80 space-y-0.5 overflow-y-auto">
              {alerts.slice(0, MAX_VISIBLE).map((alert) => (
                <Link
                  key={alert.id}
                  to={alert.clientId ? `/app/clientes/${alert.clientId}` : '/app/alertas'}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <AlertPriorityBadge severity={alert.severity} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{typeLabels[alert.type]}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-1 border-t border-border pt-1">
            <Link
              to="/app/alertas"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-center text-xs font-semibold text-primary transition-colors duration-150 hover:bg-muted"
            >
              Ver tudo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
