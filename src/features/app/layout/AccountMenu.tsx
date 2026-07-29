import { LogOut, Moon, Sun } from 'lucide-react';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '../../../lib/useOnClickOutside';
import { useTheme } from '../../theme/useTheme';
import type { RoleName } from '../../auth/auth.types';

interface AccountMenuProps {
  userName?: string;
  role?: RoleName;
  onLogout?: () => void;
  loggingOut?: boolean;
  trigger: (props: { onClick: () => void; open: boolean }) => React.ReactNode;
  align?: 'left' | 'right';
  menuPlacement?: 'up' | 'down';
}

// Menu de conta compartilhado entre o topbar (sempre visivel) e o rodape da sidebar (identidade +
// chevron). Mesma logica, dois pontos de entrada - nao duplica acao, so oferece o mesmo menu em
// dois lugares convenientes (imagem canonica mostra os dois).
export function AccountMenu({ userName, role, onLogout, loggingOut, trigger, align = 'right', menuPlacement = 'down' }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      {trigger({ onClick: () => setOpen((value) => !value), open })}

      {open && (
        <div
          role="menu"
          className={`absolute z-40 min-w-52 rounded-xl border border-border bg-card p-1.5 shadow-soft ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{userName ?? 'Usuario'}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{role ?? 'sem papel'}</p>
          </div>
          <div className="border-t border-border" />
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              disabled={loggingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {loggingOut ? 'Saindo...' : 'Sair'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
