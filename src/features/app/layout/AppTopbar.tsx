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
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
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
            <h1 className="truncate text-base font-semibold text-slate-100 sm:text-lg">
              {item?.label ?? 'HubLevel'}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {item?.description ?? 'Ambiente interno de gestao'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-200">{userName ?? 'Usuario'}</p>
            <p className="text-xs text-slate-500">Sessao ativa</p>
          </div>
          <Badge tone="brand">{role ?? 'perfil'}</Badge>
          <Button type="button" onClick={onLogout} disabled={loading}>
            {loading ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </div>
    </header>
  );
}
