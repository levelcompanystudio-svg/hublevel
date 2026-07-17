import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import { integrationClientRef } from '../integrations.api';
import type { ClientIntegration } from '../integrations.types';
import { integrationLabels } from '../integrations.types';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';

interface IntegrationTableProps {
  integrations: ClientIntegration[];
}

function formatDateTime(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function IntegrationTable({ integrations }: IntegrationTableProps) {
  if (integrations.length === 0) {
    return (
      <Card>
        <EmptyState title="Nenhuma integracao encontrada" description="As integracoes por cliente aparecerao aqui." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Provider</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Conta externa</th>
              <th className="px-5 py-3.5 font-semibold">Ultima sincronizacao</th>
              <th className="px-5 py-3.5 font-semibold">Erro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {integrations.map((integration) => {
              const client = integrationClientRef(integration);
              return (
                <tr key={`${integration.client_id}-${integration.provider}`} className="bg-card transition-colors hover:bg-card-elevated">
                  <td className="px-5 py-4 text-sm">
                    {client ? (
                      <Link to={`/app/clientes/${client.id}`} className="font-semibold text-primary hover:underline">
                        {client.trade_name || client.company_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{integrationLabels[integration.provider]}</td>
                  <td className="px-5 py-4"><IntegrationStatusBadge status={integration.status} /></td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{integration.external_account_name ?? '-'}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{formatDateTime(integration.last_sync_at)}</td>
                  <td className={`px-5 py-4 text-sm ${integration.error_message ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {integration.error_message ?? '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
