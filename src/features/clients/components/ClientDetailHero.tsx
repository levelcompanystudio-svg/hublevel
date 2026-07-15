import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import type { Client } from '../clients.types';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientDetailHeroProps {
  client: Client;
  canManage: boolean;
}

export function ClientDetailHero({ client, canManage }: ClientDetailHeroProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-bold tracking-tight text-foreground">{client.company_name}</h2>
            {client.trade_name && (
              <span className="truncate text-sm text-muted-foreground">{client.trade_name}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ClientStatusBadge status={client.status} />
            <ClientHealthBadge status={client.health_status} />
            {client.segment && (
              <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {client.segment}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Responsavel: {client.responsible?.name ?? 'Nao definido'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to="/app/clientes">
            <Button type="button" variant="ghost">Voltar</Button>
          </Link>
          {canManage && (
            <>
              <Link to={`/app/tarefas/novo?client_id=${client.id}`}>
                <Button type="button" variant="secondary">Nova tarefa</Button>
              </Link>
              <Link to={`/app/acompanhamento/novo?client_id=${client.id}`}>
                <Button type="button" variant="secondary">Nova atualizacao</Button>
              </Link>
              <Link to={`/app/reunioes/novo?client_id=${client.id}`}>
                <Button type="button" variant="secondary">Nova reuniao</Button>
              </Link>
              <Link to={`/app/documentos/novo?client_id=${client.id}`}>
                <Button type="button" variant="secondary">Novo documento</Button>
              </Link>
            </>
          )}
          <Link to={`/app/clientes/${client.id}/editar`}>
            <Button type="button" variant="primary">Editar</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
