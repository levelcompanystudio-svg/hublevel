import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getContract } from '../contracts.api';
import type { Contract } from '../contracts.types';
import { ContractHeader } from '../components/ContractHeader';
import { ContractStatusBadge } from '../components/ContractStatusBadge';
import { clientName, contractLabel, formatCurrency, formatDate } from '../components/ContractTable';

export function ContractDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canAccess = profile?.roles?.name === 'admin';

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    const contractId = id;

    async function loadContract() {
      try {
        setLoading(true);
        setError(null);
        const result = await getContract(contractId);
        if (active) setContract(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar contrato.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadContract();

    return () => {
      active = false;
    };
  }, [canAccess, id]);

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <ContractHeader
        title={contract ? contractLabel(contract) : 'Contrato'}
        description="Visualizacao individual do contrato administrativo."
      />

      {loading && <LoadingState title="Carregando contrato" />}
      {error && <ErrorState description={error} />}

      {!loading && contract && (
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link to={`/app/clientes/${contract.client_id}`} className="text-sm text-primary hover:underline">
                {clientName(contract)}
              </Link>
              <div className="mt-4">
                <ContractStatusBadge status={contract.status} />
              </div>
            </div>
            <Link to={`/app/contratos/${contract.id}/editar`}>
              <Button type="button">Editar contrato</Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Data de inicio" value={formatDate(contract.start_date)} />
            <InfoItem label="Data de encerramento" value={contract.end_date ? formatDate(contract.end_date) : 'Sem termino definido'} />
            <InfoItem label="Valor mensal" value={formatCurrency(contract.monthly_value)} />
            <InfoItem label="Dia de cobranca" value={`Dia ${contract.billing_day}`} />
            <InfoItem
              label="Prazo de aviso previo"
              value={contract.notice_period_days !== null ? `${contract.notice_period_days} dias` : 'Nao definido'}
            />
            <InfoItem label="Documento vinculado" value={contract.document_id ? 'Vinculado' : 'Sem documento vinculado'} />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Observacoes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {contract.notes || 'Nenhuma observacao cadastrada.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
