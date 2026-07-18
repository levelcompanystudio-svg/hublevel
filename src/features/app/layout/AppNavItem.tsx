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
          'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150',
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
        ].join(' ')
      }
    >
      {({ isActive }) => {
        const Icon = item.icon;
        return (
          <>
            <span
              className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary transition-opacity duration-150 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            />
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className={`truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
          </>
        );
      }}
    </NavLink>
  );
}
