import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Badge, Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listClients } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientTable } from '../components/ClientTable';

export function ClientListPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;

  useEffect(() => {
    if (role !== 'admin' && role !== 'gestor') {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadClients() {
      try {
        setLoading(true);
        setError(null);
        const result = await listClients();
        if (active) setClients(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar clientes.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadClients();

    return () => {
      active = false;
    };
  }, [role]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  const totalClients = clients.length;
  const healthyClients = clients.filter((client) => client.health_status === 'saudavel').length;
  const attentionClients = clients.filter((client) => client.health_status === 'atencao').length;
  const onboardingClients = clients.filter((client) => client.status === 'onboarding').length;
  const inactiveClients = clients.filter((client) => client.status === 'pausado' || client.status === 'encerrado').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Clientes"
        description="Carteira operacional de clientes da Level Company."
        action={(
          <Link to="/app/clientes/novo">
            <Button type="button" variant="primary">Novo cliente</Button>
          </Link>
        )}
      />

      {loading && <LoadingState title="Carregando clientes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Total de clientes" value={totalClients} tone="brand" />
            <SummaryCard label="Saudaveis" value={healthyClients} tone="success" />
            <SummaryCard label="Atencao" value={attentionClients} tone="warning" />
            <SummaryCard label="Onboarding" value={onboardingClients} />
            <SummaryCard label="Inativos" value={inactiveClients} />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">{role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}</Badge>
            <Badge>Soft delete oculto</Badge>
          </FilterBar>
          <ClientTable clients={clients} />
        </>
      )}
    </div>
  );
}
