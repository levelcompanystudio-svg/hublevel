import { ChevronRight, Menu, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';
import { getNavigationItem } from '../navigation/navigation.config';
import { useTopbar } from './TopbarContext';

interface AppTopbarProps {
  role?: RoleName;
  userName?: string;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
}

export function AppTopbar({ role, userName, onOpenMenu, onOpenSearch }: AppTopbarProps) {
  const location = useLocation();
  const item = getNavigationItem(location.pathname);
  const Icon = item?.icon;
  const initial = (userName ?? 'U').trim().charAt(0).toUpperCase();
  const { breadcrumbLabel, action } = useTopbar();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
          <div className="flex min-w-0 items-center gap-2 text-sm">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />}
            {item ? (
              <Link to={item.path} className="shrink-0 truncate font-semibold text-foreground hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="shrink-0 truncate font-semibold text-foreground">HubLevel</span>
            )}
            {breadcrumbLabel && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                <span className="truncate text-muted-foreground">{breadcrumbLabel}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden h-8 items-center gap-1.5 px-2.5 text-muted-foreground sm:flex"
            onClick={onOpenSearch}
            aria-label="Busca rapida"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <kbd className="rounded border border-border px-1 text-[10px] font-semibold">Ctrl K</kbd>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 sm:hidden"
            onClick={onOpenSearch}
            aria-label="Busca rapida"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Identidade ja aparece no rodape da sidebar (visivel junto no desktop); mostrar aqui so
              quando a sidebar esta fechada (mobile), para nao duplicar o mesmo dado na tela. */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary md:hidden"
            title={role ? `${userName ?? 'Usuario'} (${role})` : userName}
            aria-hidden="true"
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
