import { LogOut, Moon, Sun } from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';
import { useTheme } from '../../theme/useTheme';
import { getNavigationForRole } from '../navigation/navigation.config';
import { AppNavItem } from './AppNavItem';
import { NotificationsBell } from './NotificationsBell';

interface AppSidebarProps {
  role?: RoleName;
  userName?: string;
  onNavigate?: () => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

const groups = ['Visao Geral', 'Operacao', 'Gestao'] as const;

const groupLabels: Record<(typeof groups)[number], string> = {
  'Visao Geral': 'Visao Geral',
  Operacao: 'Operacao',
  Gestao: 'Gestao',
};

export function AppSidebar({ role, userName, onNavigate, onLogout, loggingOut = false }: AppSidebarProps) {
  const items = getNavigationForRole(role);
  const { theme, toggleTheme } = useTheme();
  const initials = getInitials(userName);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-white p-1">
          <img src="/branding/level-hub-favicon.png" alt="Level Hub" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">HubLevel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group}>
              <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{groupLabels[group]}</p>
              <div className="mt-1.5 space-y-0.5">
                {groupItems.map((item) => (
                  <AppNavItem key={item.path} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="relative border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">{userName ?? 'Usuario'}</p>
            <p className="truncate text-xs capitalize leading-4 text-muted-foreground">{role ?? 'sem papel'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <NotificationsBell role={role} buttonClassName={iconButtonClassName} />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className={iconButtonClassName}
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                aria-label="Sair"
                title="Sair"
                className={`${iconButtonClassName} hover:bg-destructive/10 hover:text-destructive`}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

const iconButtonClassName =
  'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-50';

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}
