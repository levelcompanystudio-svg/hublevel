import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import { integrationClientRef, syncClientIntegration } from '../integrations.api';
import type { ClientIntegration } from '../integrations.types';
import { integrationLabels } from '../integrations.types';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';

interface IntegrationTableProps {
  integrations: ClientIntegration[];
  isAdmin: boolean;
  onChanged: () => void;
}

function formatDateTime(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function IntegrationTable({ integrations, isAdmin, onChanged }: IntegrationTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);

  async function handleSync(id: string) {
    try {
      setBusyId(id);
      setRowError(null);
      await syncClientIntegration(id);
      onChanged();
    } catch (err: unknown) {
      setRowError({ id, message: err instanceof Error ? err.message : 'Erro ao sincronizar.' });
    } finally {
      setBusyId(null);
    }
  }

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
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Cliente</th>
              <th className="px-4 py-3.5 font-semibold">Provider</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Conta externa</th>
              <th className="px-4 py-3.5 font-semibold">Ultimo sync</th>
              <th className="px-4 py-3.5 font-semibold">Erro</th>
              {isAdmin && <th className="px-4 py-3.5 text-right font-semibold">Acoes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {integrations.map((integration) => {
              const client = integrationClientRef(integration);
              const rowKey = `${integration.client_id}-${integration.provider}`;
              const canSync = isAdmin && integration.provider === 'meta_ads' && integration.id;
              const busy = busyId === integration.id;

              return (
                <tr key={rowKey} className="bg-card transition-colors hover:bg-card-elevated">
                  <td className="px-4 py-3 text-sm">
                    {client ? (
                      <Link to={`/app/clientes/${client.id}`} className="font-semibold text-primary hover:underline">
                        {client.trade_name || client.company_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{integrationLabels[integration.provider]}</td>
                  <td className="px-4 py-3"><IntegrationStatusBadge status={integration.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{integration.external_account_name ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(integration.last_success_at)}</td>
                  <td className={`px-4 py-3 text-sm ${integration.error_message ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {rowError?.id === integration.id ? rowError.message : integration.error_message ?? '-'}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {canSync && (
                        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void handleSync(integration.id!)}>
                          {busy ? 'Sincronizando...' : 'Sincronizar'}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
