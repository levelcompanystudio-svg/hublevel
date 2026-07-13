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
            ? 'border-sidebar-ring bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-black/20'
            : 'border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
        ].join(' ')
      }
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-xs font-bold text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{item.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
      </span>
    </NavLink>
  );
}
