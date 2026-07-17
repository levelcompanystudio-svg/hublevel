import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listClients } from '../../clients/clients.api';
import { listAllClientIntegrations, mergeIntegrationsForClients } from '../integrations.api';
import type { ClientIntegration } from '../integrations.types';
import { IntegrationHeader } from '../components/IntegrationHeader';
import { IntegrationSummary } from '../components/IntegrationSummary';
import { IntegrationTable } from '../components/IntegrationTable';

export function IntegrationsOverviewPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  const [integrations, setIntegrations] = useState<ClientIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [clients, realRows] = await Promise.all([listClients(), listAllClientIntegrations()]);
        if (!active) return;
        setIntegrations(mergeIntegrationsForClients(clients, realRows));
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar integracoes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <IntegrationHeader
        title="Integracoes"
        description="Status de conexao de Meta Ads e Google Ads por cliente. Ainda sem OAuth real, sem armazenamento de credenciais e sem sincronizacao de metricas."
      />

      {loading && <LoadingState title="Carregando integracoes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <IntegrationSummary integrations={integrations} />
          <IntegrationTable integrations={integrations} />
          <Card>
            <h3 className="text-sm font-semibold text-foreground">Integracao real sera implementada em etapa futura</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Esta tela ja le o status real salvo por cliente, mas nenhuma conexao com Meta Ads ou Google Ads existe
              ainda: sem OAuth, sem token armazenado, sem chamada de rede a APIs externas. Os botoes de conectar,
              sincronizar e desconectar continuam desabilitados ate a proxima etapa.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
