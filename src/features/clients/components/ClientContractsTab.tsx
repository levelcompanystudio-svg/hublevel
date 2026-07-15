import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { listContracts } from '../../contracts/contracts.api';
import { ContractStatusBadge } from '../../contracts/components/ContractStatusBadge';
import { formatCurrency, formatDate } from '../../contracts/components/ContractTable';
import type { Contract } from '../../contracts/contracts.types';

interface ClientContractsTabProps {
  clientId: string;
}

export function ClientContractsTab({ clientId }: ClientContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Reaproveita listContracts() ja existente, filtrando no cliente (sem query nova).
      const result = await listContracts();
      setContracts(result.filter((contract) => contract.client_id === clientId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contratos do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState title="Carregando contratos do cliente" />;
  if (error) return <ErrorState description={error} />;

  if (contracts.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum contrato cadastrado"
          description="Os contratos administrativos deste cliente aparecerao aqui."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((contract) => (
        <Card key={contract.id} className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(contract.monthly_value)} / mes</p>
                <ContractStatusBadge status={contract.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(contract.start_date)} - {contract.end_date ? formatDate(contract.end_date) : 'Sem termino'} - Dia {contract.billing_day}
              </p>
            </div>
            <Link to={`/app/contratos/${contract.id}`}>
              <Button type="button" variant="ghost">Ver</Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
