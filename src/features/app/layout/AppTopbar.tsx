import { useLocation } from 'react-router-dom';
import { Badge, Button } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';
import { getNavigationItem } from '../navigation/navigation.config';

interface AppTopbarProps {
  role?: RoleName;
  userName?: string;
  loading?: boolean;
  onLogout: () => void;
  onOpenMenu: () => void;
}

export function AppTopbar({
  role,
  userName,
  loading = false,
  onLogout,
  onOpenMenu,
}: AppTopbarProps) {
  const location = useLocation();
  const item = getNavigationItem(location.pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 px-0 md:hidden"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
          >
            <span className="text-lg">=</span>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
              {item?.label ?? 'HubLevel'}
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {item?.description ?? 'Ambiente interno de gestao'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-lg border border-border bg-surface py-1.5 pl-1.5 pr-3 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-[11px] font-bold text-primary">
              {(userName ?? 'U').trim().charAt(0).toUpperCase()}
            </span>
            <div className="text-left">
              <p className="text-xs font-semibold leading-tight text-foreground">{userName ?? 'Usuario'}</p>
              <p className="flex items-center gap-1 text-[11px] leading-tight text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Sessao ativa
              </p>
            </div>
          </div>
          <Badge tone="brand">{role ?? 'perfil'}</Badge>
          <Button type="button" variant="secondary" onClick={onLogout} disabled={loading}>
            {loading ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </div>
    </header>
  );
}
