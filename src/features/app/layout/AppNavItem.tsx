import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../navigation/navigation.types';

interface AppNavItemProps {
  item: NavigationItem;
  onNavigate?: () => void;
}

export function AppNavItem({ item, onNavigate }: AppNavItemProps) {
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition',
          isActive
            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-100'
            : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100',
        ].join(' ')
      }
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-slate-300 group-hover:text-indigo-200">
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{item.label}</span>
        <span className="block truncate text-xs text-slate-500">{item.description}</span>
      </span>
    </NavLink>
  );
}
