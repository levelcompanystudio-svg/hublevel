import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { listClientIntegrationsByClient, mergeIntegrationsForClient } from '../../integrations/integrations.api';
import { IntegrationProviderCard } from '../../integrations/components/IntegrationProviderCard';
import type { ClientIntegration } from '../../integrations/integrations.types';

interface ClientIntegrationsTabProps {
  clientId: string;
}

export function ClientIntegrationsTab({ clientId }: ClientIntegrationsTabProps) {
  const [integrations, setIntegrations] = useState<ClientIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const realRows = await listClientIntegrationsByClient(clientId);
      setIntegrations(mergeIntegrationsForClient(clientId, realRows));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar integracoes do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState title="Carregando integracoes" />;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Integracao real sera implementada em etapa futura. Os cartoes abaixo ja mostram o status salvo para este
        cliente, mas conectar/sincronizar/desconectar ainda nao funcionam.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => (
          <IntegrationProviderCard key={integration.provider} integration={integration} />
        ))}
      </div>
    </div>
  );
}
