import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import type { Client } from '../clients.types';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientDetailHeroProps {
  client: Client;
}

function formatDate(value: string | null) {
  if (!value) return 'Sem data';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

export function ClientDetailHero({ client }: ClientDetailHeroProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            Clientes &gt; {client.company_name}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{client.company_name}</h2>
          {client.trade_name && (
            <p className="mt-2 text-base text-muted-foreground">{client.trade_name}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ClientStatusBadge status={client.status} />
            <ClientHealthBadge status={client.health_status} />
            {client.segment && (
              <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {client.segment}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to="/app/clientes">
            <Button type="button" variant="secondary">Voltar</Button>
          </Link>
          <Link to={`/app/clientes/${client.id}/editar`}>
            <Button type="button" variant="primary">Editar</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HeroItem label="Responsavel" value={client.responsible?.name ?? 'Nao definido'} />
        <HeroItem label="Inicio da parceria" value={formatDate(client.start_date)} />
        <HeroItem label="Status" value={client.status} />
        <HeroItem label="Saude" value={client.health_status} />
      </div>
    </Card>
  );
}

function HeroItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold capitalize text-foreground">{value}</p>
    </div>
  );
}
