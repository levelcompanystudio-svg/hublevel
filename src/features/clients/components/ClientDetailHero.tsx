import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnClickOutside } from '../../../lib/useOnClickOutside';
import { Button } from '../../../components/ui';
import type { Client } from '../clients.types';
import { ClientAvatar } from './ClientAvatar';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientDetailHeroProps {
  client: Client;
  canManage: boolean;
}

function ClientDetailOverflowMenu({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Mais acoes"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1.5 min-w-44 rounded-lg border border-border bg-card p-1 shadow-soft">
          <Link
            to={`/app/reunioes/novo?client_id=${clientId}`}
            onClick={() => setOpen(false)}
            className="block rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors duration-150 hover:bg-muted"
          >
            Nova reuniao
          </Link>
          <Link
            to={`/app/documentos/novo?client_id=${clientId}`}
            onClick={() => setOpen(false)}
            className="block rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors duration-150 hover:bg-muted"
          >
            Novo documento
          </Link>
        </div>
      )}
    </div>
  );
}

export function ClientDetailHero({ client, canManage }: ClientDetailHeroProps) {
  const displayName = client.trade_name || client.company_name;

  return (
    <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Link
          to="/app/clientes"
          aria-label="Voltar para clientes"
          className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>

        <ClientAvatar name={displayName} logoUrl={client.logo_url} size="lg" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="truncate text-h1 text-foreground">{displayName}</h2>
            {client.trade_name && client.trade_name !== client.company_name && (
              <span className="truncate text-sm text-muted-foreground">{client.company_name}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ClientStatusBadge status={client.status} />
            <ClientHealthBadge status={client.health_status} />
            {client.segment && <span className="text-caption">{client.segment}</span>}
            <span className="text-caption">Responsavel: {client.responsible?.name ?? 'Nao definido'}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        {canManage && (
          <>
            <Link to={`/app/tarefas/novo?client_id=${client.id}`}>
              <Button type="button" variant="ghost" size="sm">Nova tarefa</Button>
            </Link>
            <Link to={`/app/acompanhamento/novo?client_id=${client.id}`}>
              <Button type="button" variant="ghost" size="sm">Nova atualizacao</Button>
            </Link>
            <ClientDetailOverflowMenu clientId={client.id} />
          </>
        )}
        <Link to={`/app/clientes/${client.id}/editar`}>
          <Button type="button" variant="primary" size="sm">Editar</Button>
        </Link>
      </div>
    </div>
  );
}
