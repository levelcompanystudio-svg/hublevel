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
            ? 'border-primary/30 bg-primary/12 text-sidebar-accent-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_8px_20px_-10px_var(--color-primary)]'
            : 'border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold transition ${
              isActive
                ? 'border-primary/40 bg-primary text-primary-foreground'
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
