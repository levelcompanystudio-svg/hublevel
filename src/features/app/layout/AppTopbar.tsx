import { ChevronDown, ChevronRight, Menu, Search } from 'lucide-react';
import { Button } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';
import { AccountMenu } from './AccountMenu';
import { NotificationsBell } from './NotificationsBell';
import { useTopbar } from './TopbarContext';

interface AppTopbarProps {
  role?: RoleName;
  userName?: string;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

// Topbar canonico (imagens de referencia): busca proeminente + notificacoes + conta sempre
// visiveis, sem repetir o nome da pagina (o titulo ja vive no cabecalho de conteudo). O
// breadcrumb secundario (ex.: nome do cliente em /app/clientes/:id) continua aparecendo aqui
// porque nao e uma duplicacao - e informacao que so existe no topbar.
export function AppTopbar({ role, userName, onOpenMenu, onOpenSearch, onLogout, loggingOut }: AppTopbarProps) {
  const initial = (userName ?? 'U').trim().charAt(0).toUpperCase();
  const { breadcrumbLabel, action } = useTopbar();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 px-0 md:hidden"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>

        {breadcrumbLabel && (
          <div className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            <span className="truncate">{breadcrumbLabel}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 text-left text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/30 hover:bg-card-elevated sm:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Buscar ou digitar comando...</span>
          <kbd className="hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold sm:block">
            Ctrl K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {action}
          <NotificationsBell
            role={role}
            buttonClassName="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          />
          <AccountMenu
            userName={userName}
            role={role}
            onLogout={onLogout}
            loggingOut={loggingOut}
            trigger={({ onClick, open }) => (
              <button
                type="button"
                onClick={onClick}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex h-9 items-center gap-1.5 rounded-lg px-1.5 transition-colors duration-150 hover:bg-muted"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {initial}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium text-foreground md:inline">{userName ?? 'Usuario'}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground md:block" aria-hidden="true" />
              </button>
            )}
          />
        </div>
      </div>
    </header>
  );
}
