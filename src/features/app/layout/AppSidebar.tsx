import { ChevronDown, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';
import { useSidebarCollapsed } from '../../../lib/useSidebarCollapsed';
import { getNavigationForRole } from '../navigation/navigation.config';
import { AccountMenu } from './AccountMenu';
import { AppNavItem } from './AppNavItem';

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
  const { collapsed: persistedCollapsed, toggleCollapsed } = useSidebarCollapsed();
  const collapsed = allowCollapse && persistedCollapsed;
  const initials = getInitials(userName);

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`}
      style={{ boxShadow: 'inset -1px 0 0 0 color-mix(in oklch, var(--primary) 12%, transparent)' }}
    >
      <div className={`flex px-4 py-5 ${collapsed ? 'flex-col items-center gap-2 px-2.5' : 'items-center gap-2.5'}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-card p-1 shadow-soft">
          <img src="/branding/level-hub-favicon.png" alt="Level Hub" className="h-full w-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">HubLevel</p>
          </div>
        )}
        {allowCollapse && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={persistedCollapsed ? 'Expandir menu' : 'Recolher menu'}
            title={persistedCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className={iconButtonClassName}
          >
            {persistedCollapsed ? <ChevronsRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <ChevronsLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          </button>
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
                <p className="text-label px-2.5 text-muted-foreground/70">{groupLabels[group]}</p>
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
        <AccountMenu
          userName={userName}
          role={role}
          onLogout={onLogout}
          loggingOut={loggingOut}
          align="left"
          menuPlacement="up"
          trigger={({ onClick, open }) => (
            <button
              type="button"
              onClick={onClick}
              aria-expanded={open}
              aria-haspopup="menu"
              className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors duration-150 hover:bg-sidebar-accent/50 ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary" title={collapsed ? userName : undefined}>
                {initials}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-sidebar-foreground">{userName ?? 'Usuario'}</span>
                    <span className="block truncate text-xs capitalize leading-4 text-muted-foreground">{role ?? 'sem papel'}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </>
              )}
            </button>
          )}
        />
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
