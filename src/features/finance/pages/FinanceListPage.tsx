import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listFinancialRecords } from '../finance.api';
import type { FinancialRecord } from '../finance.types';
import { FinanceHeader } from '../components/FinanceHeader';
import { FinanceTable } from '../components/FinanceTable';

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

  return (
    <div className="space-y-6">
      <FinanceHeader title="Financeiro" description="Registros financeiros e pagamentos da operacao." actionLabel="Novo registro" actionTo="/app/financeiro/novo" />
      {loading && <LoadingState title="Carregando financeiro" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && <FinanceTable records={records} />}
    </div>
  );
}
