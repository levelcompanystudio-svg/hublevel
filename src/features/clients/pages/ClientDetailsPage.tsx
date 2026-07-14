import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getClient } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientDetailHero } from '../components/ClientDetailHero';
import { ClientOverviewTabs } from '../components/ClientOverviewTabs';

function formatDate(value: string | null) {
  if (!value) return 'Sem data';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

export function ClientDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;

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

    void loadClient();

    return () => {
      active = false;
    };
  }, [id, role]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      {loading && <LoadingState title="Carregando cliente" />}
      {error && <ErrorState description={error} />}

      {!loading && client && (
        <>
          <ClientDetailHero client={client} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Status do cliente" value={client.status} />
            <SummaryCard label="Saude" value={client.health_status} tone={client.health_status === 'saudavel' ? 'success' : 'warning'} />
            <SummaryCard label="Responsavel" value={client.responsible?.name ?? 'Nao definido'} />
            <SummaryCard label="Inicio da parceria" value={formatDate(client.start_date)} tone="brand" />
          </div>

          <ClientOverviewTabs client={client} />
        </>
      )}
    </div>
  );
}
