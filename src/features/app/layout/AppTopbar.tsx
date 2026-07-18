import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';
import { getNavigationItem } from '../navigation/navigation.config';

interface AppTopbarProps {
  role?: RoleName;
  userName?: string;
  onOpenMenu: () => void;
}

export function AppTopbar({ role, userName, onOpenMenu }: AppTopbarProps) {
  const location = useLocation();
  const item = getNavigationItem(location.pathname);
  const initial = (userName ?? 'U').trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 md:hidden"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
          <h1 className="truncate text-sm font-semibold text-foreground">{item?.label ?? 'HubLevel'}</h1>
        </div>

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
          title={role ? `${userName ?? 'Usuario'} (${role})` : userName}
          aria-hidden="true"
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
