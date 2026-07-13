import type { RoleName } from '../../auth/auth.types';
import { useTheme } from '../../theme/useTheme';
import { getNavigationForRole } from '../navigation/navigation.config';
import { AppNavItem } from './AppNavItem';

interface AppSidebarProps {
  role?: RoleName;
  userName?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ role, userName, onNavigate }: AppSidebarProps) {
  const items = getNavigationForRole(role);
  const groups = ['Dashboard', 'Operacao', 'Administracao'] as const;
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-sm shadow-black/20">
            HL
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">HubLevel</p>
            <p className="text-xs text-muted-foreground">Operacao interna</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
              <div className="mt-2 space-y-1">
                {groupItems.map((item) => (
                  <AppNavItem key={item.path} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground transition hover:brightness-110"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <div className="min-w-0 flex-1 rounded-lg border border-sidebar-border bg-sidebar-accent/70 p-3">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">{userName ?? 'Usuario'}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">{role ?? 'sem papel'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
