import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import type { Payment } from '../finance.types';
import { formatCurrency } from './FinanceTable';
import { PaymentMethodBadge } from './PaymentMethodBadge';

interface PaymentsListProps {
  payments: Payment[];
}

export function PaymentsList({ payments }: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <EmptyState title="Nenhum pagamento registrado" description="Pagamentos vinculados a este registro aparecerao aqui." />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-100">Pagamentos vinculados</h3>
      <div className="mt-4 space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{formatCurrency(payment.amount)}</p>
                <p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat('pt-BR').format(new Date(payment.paid_at))}</p>
              </div>
              <PaymentMethodBadge method={payment.method} />
            </div>
            {payment.notes && <p className="mt-3 text-sm text-slate-400">{payment.notes}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}
