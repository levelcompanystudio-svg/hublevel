import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { getClientIntegrations } from '../../integrations/integrations.api';
import { IntegrationsGrid } from '../../integrations/components/IntegrationsGrid';
import type { IntegrationInfo } from '../../integrations/integrations.types';

interface ClientIntegrationsTabProps {
  clientId: string;
}

export function ClientIntegrationsTab({ clientId }: ClientIntegrationsTabProps) {
  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getClientIntegrations(clientId);
      setIntegrations(result);
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
        Nenhuma integracao real esta conectada para este cliente. Os canais abaixo ficam prontos para conexao futura.
      </p>
      <IntegrationsGrid integrations={integrations} />
    </div>
  );
}
