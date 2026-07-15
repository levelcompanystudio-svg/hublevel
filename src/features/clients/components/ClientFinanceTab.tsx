import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Button, Card } from '../../../components/ui';
import { listFinancialRecords } from '../../finance/finance.api';
import { FinanceStatusBadge } from '../../finance/components/FinanceStatusBadge';
import { formatCurrency, formatDate, formatMonth } from '../../finance/components/FinanceTable';
import type { FinancialRecord } from '../../finance/finance.types';

interface ClientFinanceTabProps {
  clientId: string;
}

export function ClientFinanceTab({ clientId }: ClientFinanceTabProps) {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Reaproveita listFinancialRecords() ja existente, filtrando no cliente (sem query nova).
      const result = await listFinancialRecords();
      setRecords(result.filter((record) => record.client_id === clientId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState title="Carregando financeiro do cliente" />;
  if (error) return <ErrorState description={error} />;

  const previsto = records.filter((r) => r.status === 'previsto' || r.status === 'atrasado').reduce((sum, r) => sum + r.amount, 0);
  const recebido = records.filter((r) => r.status === 'pago').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Registros" value={records.length} tone="brand" />
        <SummaryCard label="Receita prevista" value={formatCurrency(previsto)} tone="warning" />
        <SummaryCard label="Receita recebida" value={formatCurrency(recebido)} tone="success" />
      </div>

      {records.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum registro financeiro"
            description="Os lancamentos financeiros deste cliente aparecerao aqui."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{record.description || 'Sem descricao'}</p>
                    <FinanceStatusBadge status={record.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Competencia {formatMonth(record.competence_month)} - Vencimento {formatDate(record.due_date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(record.amount)}</span>
                  <Link to={`/app/financeiro/${record.id}`}>
                    <Button type="button" variant="ghost">Ver</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
