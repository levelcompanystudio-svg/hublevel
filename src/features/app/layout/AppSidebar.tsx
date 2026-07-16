import { Moon, Sun } from 'lucide-react';
import type { RoleName } from '../../auth/auth.types';
import { useTheme } from '../../theme/useTheme';
import { getNavigationForRole } from '../navigation/navigation.config';
import { AppNavItem } from './AppNavItem';

interface AppSidebarProps {
  role?: RoleName;
  userName?: string;
  onNavigate?: () => void;
}

const groups = ['Visao Geral', 'Operacao', 'Gestao', 'Administracao'] as const;

const groupLabels: Record<(typeof groups)[number], string> = {
  'Visao Geral': 'Visão Geral',
  Operacao: 'Operação',
  Gestao: 'Gestão',
  Administracao: 'Administração',
};

export function AppSidebar({ role, userName, onNavigate }: AppSidebarProps) {
  const items = getNavigationForRole(role);
  const { theme, toggleTheme } = useTheme();
  const initials = getInitials(userName);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary to-primary/60 text-sm font-bold text-primary-foreground shadow-[0_0_28px_-6px_var(--color-primary)]">
            HL
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">HubLevel</p>
            <p className="truncate text-xs text-muted-foreground">Central operacional</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{groupLabels[group]}</p>
              <div className="mt-2 space-y-1">
                {groupItems.map((item) => (
                  <AppNavItem key={item.path} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-black/20 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">{userName ?? 'Usuario'}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{role ?? 'sem papel'}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar text-sidebar-accent-foreground transition hover:border-primary/50 hover:bg-sidebar-accent hover:text-primary"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}
