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
          'group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition',
          isActive
            ? 'border-sidebar-ring/40 bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-black/20'
            : 'border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition ${
              isActive
                ? 'border-sidebar-ring/40 bg-sidebar-primary text-sidebar-primary-foreground'
                : 'border-sidebar-border bg-sidebar text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
            }`}
          >
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.label}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
          </span>
        </>
      )}
    </NavLink>
  );
}
