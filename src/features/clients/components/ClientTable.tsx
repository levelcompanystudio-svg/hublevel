import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Client } from '../clients.types';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientStatusBadge } from './ClientStatusBadge';

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum cliente cadastrado"
          description="Crie o primeiro cliente para iniciar a operacao da carteira no HubLevel."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Responsavel</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Saude</th>
              <th className="px-5 py-3.5 font-semibold">Inicio</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => (
              <tr key={client.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{client.company_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {client.trade_name || client.segment || 'Sem nome fantasia'}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-foreground">{client.responsible?.name ?? 'Sem responsavel'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{client.responsible?.email ?? '-'}</p>
                </td>
                <td className="px-5 py-4">
                  <ClientStatusBadge status={client.status} />
                </td>
                <td className="px-5 py-4">
                  <ClientHealthBadge status={client.health_status} />
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {client.start_date || '-'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/clientes/${client.id}`}>
                      <Button type="button" variant="ghost">
                        Ver
                      </Button>
                    </Link>
                    <Link to={`/app/clientes/${client.id}/editar`}>
                      <Button type="button">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
