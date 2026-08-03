import { ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui';
import { ClientHealthBadge } from '../clients/components/ClientHealthBadge';
import { ClientStatusBadge } from '../clients/components/ClientStatusBadge';
import type { ExternalClientLink } from './external.api';

interface ExternalClientSelectorProps {
  links: ExternalClientLink[];
  onSelect: (clientId: string) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

// Selecao simples quando o usuario externo tem mais de um cliente vinculado. Nome real via RLS
// (migration 033) - nao mostra mais um id truncado.
export function ExternalClientSelector({ links, onSelect }: ExternalClientSelectorProps) {
  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="text-center">
        <h1 className="text-h1 text-foreground">Selecione um cliente</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sua conta esta vinculada a mais de um cliente no HubLevel.</p>
      </div>

      <div className="space-y-2">
        {links.map(({ membership, client }) => {
          const name = client.trade_name || client.company_name;
          return (
            <button key={membership.id} type="button" onClick={() => onSelect(client.id)} className="block w-full text-left">
              <Card className="transition-colors duration-150 hover:border-primary/30 hover:bg-card-elevated">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-semibold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {initials(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{client.segment ?? 'Sem segmento'}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <ClientStatusBadge status={client.status} />
                    <ClientHealthBadge status={client.health_status} />
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
