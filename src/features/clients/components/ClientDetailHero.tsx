import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui';
import type { Client } from '../clients.types';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientDetailHeroProps {
  client: Client;
  canManage: boolean;
}

export function ClientDetailHero({ client, canManage }: ClientDetailHeroProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to="/app/clientes"
              aria-label="Voltar para clientes"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <h2 className="truncate text-h2 text-foreground">{client.company_name}</h2>
            {client.trade_name && <span className="truncate text-sm text-muted-foreground">{client.trade_name}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-9">
            <ClientStatusBadge status={client.status} />
            <ClientHealthBadge status={client.health_status} />
            {client.segment && <span className="text-caption">{client.segment}</span>}
            <span className="text-caption">Responsavel: {client.responsible?.name ?? 'Nao definido'}</span>
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
              <Link to={`/app/reunioes/novo?client_id=${client.id}`}>
                <Button type="button" variant="ghost" size="sm">Nova reuniao</Button>
              </Link>
              <Link to={`/app/documentos/novo?client_id=${client.id}`}>
                <Button type="button" variant="ghost" size="sm">Novo documento</Button>
              </Link>
            </>
          )}
          <Link to={`/app/clientes/${client.id}/editar`}>
            <Button type="button" variant="primary" size="sm">Editar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
