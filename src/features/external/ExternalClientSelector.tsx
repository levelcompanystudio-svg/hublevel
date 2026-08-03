import { Card } from '../../components/ui';
import type { ExternalClientMembership } from './external.api';

interface ExternalClientSelectorProps {
  memberships: ExternalClientMembership[];
  onSelect: (clientId: string) => void;
}

// Selecao simples quando o usuario externo tem mais de um cliente vinculado. Sem nome de cliente
// disponivel (ver nota em ExternalClientPortal.tsx): mostra "Cliente" + um trecho curto do id
// real como diferenciador, nunca um nome inventado.
export function ExternalClientSelector({ memberships, onSelect }: ExternalClientSelectorProps) {
  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Selecione um cliente</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sua conta esta vinculada a mais de um cliente no HubLevel.</p>
      </div>

      <div className="space-y-2">
        {memberships.map((membership) => (
          <button key={membership.id} type="button" onClick={() => onSelect(membership.client_id)} className="block w-full text-left">
            <Card className="transition-colors duration-150 hover:bg-card-elevated">
              <p className="text-sm font-semibold text-foreground">Cliente {membership.client_id.slice(0, 8)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Acesso: {membership.membership_role}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
