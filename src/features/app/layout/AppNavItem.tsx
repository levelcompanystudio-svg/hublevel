import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../navigation/navigation.types';

interface AppNavItemProps {
  item: NavigationItem;
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function AppNavItem({ item, onNavigate, collapsed = false }: AppNavItemProps) {
  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-primary/10 font-semibold text-foreground'
            : 'font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
        ].join(' ')
      }
    >
      {({ isActive }) => {
        const Icon = item.icon;
        return (
          <>
            <Icon
              className={`h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`}
              strokeWidth={2}
              aria-hidden="true"
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </>
        );
      }}
    </NavLink>
  );
}
