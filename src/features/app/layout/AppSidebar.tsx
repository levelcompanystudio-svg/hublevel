import type { RoleName } from '../../auth/auth.types';
import { getNavigationForRole } from '../navigation/navigation.config';
import { AppNavItem } from './AppNavItem';

interface AppSidebarProps {
  role?: RoleName;
  userName?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ role, userName, onNavigate }: AppSidebarProps) {
  const items = getNavigationForRole(role);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-sm font-bold text-indigo-200">
            HL
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">HubLevel</p>
            <p className="text-xs text-slate-500">Operacao interna</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <AppNavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-slate-800 px-5 py-4">
        <p className="truncate text-xs font-semibold text-slate-300">{userName ?? 'Usuario'}</p>
        <p className="mt-1 text-xs capitalize text-slate-500">{role ?? 'sem papel'}</p>
      </div>
    </aside>
  );
}
