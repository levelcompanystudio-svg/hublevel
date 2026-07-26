import { useCallback, useEffect, useState } from 'react';
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
  const isAdmin = role === 'admin';

  const [integrations, setIntegrations] = useState<ClientIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [clients, realRows] = await Promise.all([listClients(), listAllClientIntegrations()]);
      setIntegrations(mergeIntegrationsForClients(clients, realRows));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar integracoes.');
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-5">
      <IntegrationHeader
        title="Integracoes"
        description="Status de conexao de Meta Ads e Google Ads por cliente. Meta Ads ja sincroniza metricas reais; Google Ads segue preparado na arquitetura."
      />

      {loading && <LoadingState title="Carregando integracoes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <IntegrationSummary integrations={integrations} />
          <IntegrationTable integrations={integrations} isAdmin={isAdmin} onChanged={() => void load()} />
          <Card>
            <h3 className="text-sm font-semibold text-foreground">Meta Ads real, Google Ads preparado</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Conectar uma conta e a sincronizacao manual ficam disponiveis na aba Integracoes de cada cliente (admin).
              Google Ads ja tem a mesma arquitetura pronta no servidor, mas ainda sem chamada real a API do Google.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
