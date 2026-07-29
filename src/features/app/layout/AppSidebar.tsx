import { ChevronsLeft, ChevronsRight, LogOut, Moon, Search, Sun } from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';
import { useSidebarCollapsed } from '../../../lib/useSidebarCollapsed';
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
  allowCollapse?: boolean;
  onOpenSearch: () => void;
}

const groups = ['Visao Geral', 'Operacao', 'Gestao'] as const;

const groupLabels: Record<(typeof groups)[number], string> = {
  'Visao Geral': 'Visao Geral',
  Operacao: 'Operacao',
  Gestao: 'Gestao',
};

export function AppSidebar({ role, userName, onNavigate, onLogout, loggingOut = false, allowCollapse = true, onOpenSearch }: AppSidebarProps) {
  const items = getNavigationForRole(role);
  const { theme, toggleTheme } = useTheme();
  const { collapsed: persistedCollapsed, toggleCollapsed } = useSidebarCollapsed();
  const collapsed = allowCollapse && persistedCollapsed;
  const initials = getInitials(userName);

  return (
    <aside className={`flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className={`flex items-center gap-2.5 px-4 py-5 ${collapsed ? 'justify-center px-2.5' : ''}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-card p-1 shadow-soft">
          <img src="/branding/level-hub-favicon.png" alt="Level Hub" className="h-full w-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">HubLevel</p>
          </div>
        )}
      </div>

      <div className={`border-t border-sidebar-border/70 ${collapsed ? 'mx-2.5' : 'mx-4'}`} aria-hidden="true" />

      <div className={`px-2.5 pt-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Busca rapida (Ctrl+K)"
          className={
            collapsed
              ? 'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              : 'flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/20 px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent/40'
          }
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">Buscar...</span>
              <kbd className="shrink-0 rounded-md border border-sidebar-border/70 px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group}>
              {!collapsed && (
                <p className="px-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">{groupLabels[group]}</p>
              )}
              <div className={`space-y-1 ${collapsed ? '' : 'mt-2'}`}>
                {groupItems.map((item) => (
                  <AppNavItem key={item.path} item={item} onNavigate={onNavigate} collapsed={collapsed} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border/70 p-3">
        <div className={`flex items-center gap-2 rounded-lg p-2 transition-colors duration-150 hover:bg-sidebar-accent/50 ${collapsed ? 'flex-col' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary" title={collapsed ? userName : undefined}>
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">{userName ?? 'Usuario'}</p>
              <p className="truncate text-xs capitalize leading-4 text-muted-foreground">{role ?? 'sem papel'}</p>
            </div>
          )}
          <div className={`flex shrink-0 items-center gap-0.5 ${collapsed ? 'flex-col gap-1' : ''}`}>
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

        {allowCollapse && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={persistedCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={persistedCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className={`mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground ${collapsed ? 'justify-center' : ''}`}
          >
            {persistedCollapsed ? <ChevronsRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <ChevronsLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            {!collapsed && <span>Recolher</span>}
          </button>
        )}
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
