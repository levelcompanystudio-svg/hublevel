import { Search, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from '../../../lib/useOnClickOutside';
import { listClients } from '../../clients/clients.api';
import type { Client } from '../../clients/clients.types';
import type { RoleName } from '../../auth/auth.types';
import { getNavigationForRole } from '../navigation/navigation.config';

interface CommandPaletteProps {
  open: boolean;
  role?: RoleName;
  onClose: () => void;
}

interface ResultItem {
  key: string;
  label: string;
  hint: string;
  icon: 'nav' | 'client';
  href: string;
}

// Busca client-side sobre dados ja carregados: itens de navegacao (estaticos) + clientes via
// listClients() ja existente (mesma query usada em /app/clientes). Sem endpoint ou query nova.
export function CommandPalette({ open, role, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useOnClickOutside(containerRef, onClose);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    inputRef.current?.focus();

    if (role === 'admin' || role === 'gestor') {
      let active = true;
      listClients()
        .then((result) => { if (active) setClients(result); })
        .catch(() => { if (active) setClients([]); });
      return () => { active = false; };
    }
  }, [open, role]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const results = useMemo<ResultItem[]>(() => {
    const normalized = query.trim().toLowerCase();
    const navItems = getNavigationForRole(role).map((item) => ({
      key: `nav-${item.path}`,
      label: item.label,
      hint: 'Navegar',
      icon: 'nav' as const,
      href: item.path,
    }));
    const clientItems = clients.map((client) => ({
      key: `client-${client.id}`,
      label: client.trade_name || client.company_name,
      hint: 'Cliente',
      icon: 'client' as const,
      href: `/app/clientes/${client.id}`,
    }));
    const all = [...navItems, ...clientItems];
    if (!normalized) return all.slice(0, 8);
    return all.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query, clients, role]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function goTo(item: ResultItem) {
    navigate(item.href);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = results[activeIndex];
      if (item) goTo(item);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm">
      <div
        ref={containerRef}
        role="dialog"
        aria-label="Busca rapida"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-soft"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar paginas ou clientes..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhum resultado para "{query}".</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goTo(item)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100 ${
                  index === activeIndex ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {item.icon === 'client' ? (
                  <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{item.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.hint}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
