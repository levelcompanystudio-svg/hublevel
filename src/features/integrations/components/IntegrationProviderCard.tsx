import { Button, Card } from '../../../components/ui';
import type { ClientIntegration } from '../integrations.types';
import { integrationDescriptions, integrationLabels, integrationMonograms } from '../integrations.types';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';

interface IntegrationProviderCardProps {
  integration: ClientIntegration;
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Nunca sincronizado';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function IntegrationProviderCard({ integration }: IntegrationProviderCardProps) {
  const { provider, status } = integration;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold text-muted-foreground">
            {integrationMonograms[provider]}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{integrationLabels[provider]}</p>
            <IntegrationStatusBadge status={status} />
          </div>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">{integrationDescriptions[provider]}</p>

      <dl className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <dt>Conta externa</dt>
          <dd className="font-medium text-foreground">{integration.external_account_name ?? 'Nao configurada'}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Ultima sincronizacao</dt>
          <dd className="font-medium text-foreground">{formatDateTime(integration.last_sync_at)}</dd>
        </div>
      </dl>

      {integration.error_message && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {integration.error_message}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button type="button" variant="primary" disabled aria-label="Conectar" title="Integracao real sera implementada em etapa futura">
          Em breve
        </Button>
        <Button type="button" variant="secondary" disabled aria-label="Sincronizar" title="Integracao real sera implementada em etapa futura">
          Em breve
        </Button>
        <Button type="button" variant="ghost" disabled aria-label="Desconectar" title="Integracao real sera implementada em etapa futura">
          Em breve
        </Button>
      </div>
    </Card>
  );
}
