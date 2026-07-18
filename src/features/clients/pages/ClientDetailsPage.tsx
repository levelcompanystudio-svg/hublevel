import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { computeClientOverviewMetrics, getClientOverview } from '../client-overview.api';
import type { ClientOverviewData, ClientOverviewMetrics } from '../client-overview.types';
import { getClient } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientDetailHero } from '../components/ClientDetailHero';
import { ClientKpiRow } from '../components/ClientKpiRow';
import { ClientOverviewTabs } from '../components/ClientOverviewTabs';

export function ClientDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<ClientOverviewData | null>(null);
  const [metrics, setMetrics] = useState<ClientOverviewMetrics | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const canManage = role === 'admin' || role === 'gestor';

  useEffect(() => {
    if (!id || (role !== 'admin' && role !== 'gestor')) {
      setLoading(false);
      return;
    }

    let active = true;
    const clientId = id;

    async function loadClient() {
      try {
        setLoading(true);
        setError(null);
        const result = await getClient(clientId);
        if (active) setClient(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar cliente.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadOverview() {
      try {
        setOverviewLoading(true);
        setOverviewError(null);
        const data = await getClientOverview(clientId);
        if (!active) return;
        setOverview(data);
        setMetrics(computeClientOverviewMetrics(data));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar resumo operacional do cliente.';
        if (active) setOverviewError(message);
      } finally {
        if (active) setOverviewLoading(false);
      }
    }

    void loadClient();
    void loadOverview();

    return () => {
      active = false;
    };
  }, [id, role]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-4">
      {loading && <LoadingState title="Carregando cliente" />}
      {error && <ErrorState description={error} />}

      {!loading && client && (
        <>
          <ClientDetailHero client={client} canManage={canManage} />

          {overviewLoading && <LoadingState title="Calculando indicadores do cliente" />}
          {overviewError && <ErrorState description={overviewError} />}
          {!overviewLoading && !overviewError && metrics && <ClientKpiRow metrics={metrics} />}

          <ClientOverviewTabs
            client={client}
            role={role}
            overview={overview}
            metrics={metrics}
            overviewLoading={overviewLoading}
            overviewError={overviewError}
          />
        </>
      )}
    </div>
  );
}
