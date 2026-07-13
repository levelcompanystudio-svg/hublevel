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
import { listFinancialRecords } from '../finance.api';
import type { FinancialRecord } from '../finance.types';
import { FinanceTable, formatCurrency } from '../components/FinanceTable';

export function FinanceListPage() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
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
        const result = await listFinancialRecords();
        if (active) setRecords(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro.');
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

  const totalPrevisto = records
    .filter((record) => record.status === 'previsto')
    .reduce((sum, record) => sum + record.amount, 0);
  const totalPago = records
    .filter((record) => record.status === 'pago')
    .reduce((sum, record) => sum + record.amount, 0);
  const totalAtrasado = records
    .filter((record) => record.status === 'atrasado')
    .reduce((sum, record) => sum + record.amount, 0);
  const openRecords = records.filter((record) => record.status === 'previsto' || record.status === 'atrasado').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracao"
        title="Financeiro"
        description="Registros financeiros e pagamentos da operacao."
        action={(
          <Link to="/app/financeiro/novo">
            <Button type="button" variant="primary">Novo registro</Button>
          </Link>
        )}
      />
      {loading && <LoadingState title="Carregando financeiro" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total previsto" value={formatCurrency(totalPrevisto)} tone="brand" />
            <SummaryCard label="Total pago" value={formatCurrency(totalPago)} tone="success" />
            <SummaryCard label="Total atrasado" value={formatCurrency(totalAtrasado)} tone="warning" />
            <SummaryCard label="Registros em aberto" value={openRecords} />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">Admin only</Badge>
            <Badge>Pagamentos vinculados</Badge>
          </FilterBar>
          <FinanceTable records={records} />
        </>
      )}
    </div>
  );
}
