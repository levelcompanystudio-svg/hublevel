import { Badge } from '../../../components/ui';
import type { DeliverableStatus } from '../deliverables.types';

const labels: Record<DeliverableStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  delivered: 'Entregue',
  approved: 'Aprovado',
  overdue: 'Atrasado',
  canceled: 'Cancelado',
};

export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const tone =
    status === 'approved' || status === 'delivered'
      ? 'success'
      : status === 'overdue'
        ? 'destructive'
        : status === 'in_progress'
          ? 'brand'
          : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

export { labels as deliverableStatusLabels };
