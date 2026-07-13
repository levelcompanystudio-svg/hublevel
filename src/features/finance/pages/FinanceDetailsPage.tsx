import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createPayment, getFinancialRecord, listPayments } from '../finance.api';
import type { FinancialRecord, Payment, PaymentFormValues } from '../finance.types';
import { emptyPaymentFormValues } from '../finance.types';
import { FinanceHeader } from '../components/FinanceHeader';
import { FinanceStatusBadge } from '../components/FinanceStatusBadge';
import { clientName, formatCurrency, formatDate, formatMonth } from '../components/FinanceTable';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentsList } from '../components/PaymentsList';

export function FinanceDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentValues, setPaymentValues] = useState<PaymentFormValues>(emptyPaymentFormValues);
  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canAccess = profile?.roles?.name === 'admin';

  async function loadData(recordId: string, active = true) {
    try {
      setLoading(true);
      setError(null);
      const [recordResult, paymentRows] = await Promise.all([
        getFinancialRecord(recordId),
        listPayments(recordId),
      ]);
      if (!active) return;
      setRecord(recordResult);
      setPayments(paymentRows);
    } catch (err: unknown) {
      if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar financeiro.');
    } finally {
      if (active) setLoading(false);
    }
  }

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    void loadData(id, active);
    return () => {
      active = false;
    };
  }, [canAccess, id]);

  async function handlePaymentSubmit() {
    if (!id || !profile) return;
    try {
      setSavingPayment(true);
      setError(null);
      await createPayment(id, paymentValues, profile.id);
      setPaymentValues(emptyPaymentFormValues);
      await loadData(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento.');
    } finally {
      setSavingPayment(false);
    }
  }

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <FinanceHeader title="Registro financeiro" description="Detalhe administrativo do lancamento e seus pagamentos." />
      {loading && <LoadingState title="Carregando registro financeiro" />}
      {error && <ErrorState description={error} />}
      {!loading && record && (
        <>
          <Card>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">{clientName(record)}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-100">{record.description || 'Sem descricao'}</h3>
                <div className="mt-4"><FinanceStatusBadge status={record.status} /></div>
              </div>
              <Link to={`/app/financeiro/${record.id}/editar`}>
                <Button type="button">Editar registro</Button>
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Competencia" value={formatMonth(record.competence_month)} />
              <InfoItem label="Valor" value={formatCurrency(record.amount)} />
              <InfoItem label="Vencimento" value={formatDate(record.due_date)} />
              <InfoItem label="Data de pagamento" value={formatDate(record.payment_date)} />
            </div>
            <div className="mt-6 rounded-md border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Observacoes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{record.notes || 'Nenhuma observacao cadastrada.'}</p>
            </div>
          </Card>
          <PaymentsList payments={payments} />
          <PaymentForm values={paymentValues} loading={savingPayment} onChange={setPaymentValues} onSubmit={handlePaymentSubmit} />
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
