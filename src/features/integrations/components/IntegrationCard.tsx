import { Button, Card } from '../../../components/ui';
import type { IntegrationInfo } from '../integrations.types';
import { integrationDescriptions, integrationLabels, integrationMonograms } from '../integrations.types';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';

interface IntegrationCardProps {
  integration: IntegrationInfo;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const { provider, status } = integration;

  return (
    <Card className="flex flex-col gap-4 border-dashed">
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

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">Preparado para integracao futura</p>
        <Button type="button" variant="secondary" disabled title="Conexao real ainda nao disponivel">
          Conectar
        </Button>
      </div>
    </Card>
  );
}
