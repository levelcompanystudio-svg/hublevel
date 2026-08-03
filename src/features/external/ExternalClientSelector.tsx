import { Card } from '../../components/ui';
import { ClientHealthBadge } from '../clients/components/ClientHealthBadge';
import { ClientStatusBadge } from '../clients/components/ClientStatusBadge';
import type { ExternalClientLink } from './external.api';

interface ExternalClientSelectorProps {
  links: ExternalClientLink[];
  onSelect: (clientId: string) => void;
}

// Selecao simples quando o usuario externo tem mais de um cliente vinculado. Nome real via RLS
// (migration 033) - nao mostra mais um id truncado.
export function ExternalClientSelector({ links, onSelect }: ExternalClientSelectorProps) {
  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Selecione um cliente</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sua conta esta vinculada a mais de um cliente no HubLevel.</p>
      </div>

      <div className="space-y-2">
        {links.map(({ membership, client }) => (
          <button key={membership.id} type="button" onClick={() => onSelect(client.id)} className="block w-full text-left">
            <Card className="transition-colors duration-150 hover:bg-card-elevated">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{client.trade_name || client.company_name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{client.segment ?? 'Sem segmento'}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ClientStatusBadge status={client.status} />
                  <ClientHealthBadge status={client.health_status} />
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
