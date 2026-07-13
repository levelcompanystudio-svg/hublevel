import { Badge } from '../../../components/ui';
import type { FinancialStatus } from '../finance.types';

const labels: Record<FinancialStatus, string> = {
  previsto: 'Previsto',
  pago: 'Pago',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
};

export function FinanceStatusBadge({ status }: { status: FinancialStatus }) {
  const tone = status === 'pago' ? 'success' : status === 'atrasado' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
