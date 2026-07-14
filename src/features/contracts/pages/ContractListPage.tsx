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
import { listContracts } from '../contracts.api';
import type { Contract } from '../contracts.types';
import { ContractTable, formatCurrency } from '../components/ContractTable';

export function ContractListPage() {
  const { profile } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canAccess = profile?.roles?.name === 'admin';

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
        const result = await listContracts();
        if (active) setContracts(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar contratos.');
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

  const activeContracts = contracts.filter((contract) => contract.status === 'ativo');
  const expiredContracts = contracts.filter((contract) => contract.status === 'vencido').length;
  const monthlyRevenue = activeContracts.reduce((sum, contract) => sum + contract.monthly_value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracao"
        title="Contratos"
        description="Controle administrativo de contratos vinculados aos clientes da Level Company."
        action={(
          <Link to="/app/contratos/novo">
            <Button type="button" variant="primary">Novo contrato</Button>
          </Link>
        )}
      />

      {loading && <LoadingState title="Carregando contratos" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total de contratos" value={contracts.length} tone="brand" />
            <SummaryCard label="Contratos ativos" value={activeContracts.length} tone="success" />
            <SummaryCard label="Contratos vencidos" value={expiredContracts} tone="warning" />
            <SummaryCard label="Receita mensal contratada" value={formatCurrency(monthlyRevenue)} tone="brand" />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">Admin only</Badge>
            <Badge>Vinculado a clientes</Badge>
          </FilterBar>
          <ContractTable contracts={contracts} />
        </>
      )}
    </div>
  );
}
