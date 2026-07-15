import { Badge } from '../../../components/ui';
import type { DeliverableStatus } from '../deliverables.types';

const labels: Record<DeliverableStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluido',
  vencido: 'Vencido',
};

export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const tone =
    status === 'concluido' ? 'success' : status === 'vencido' ? 'destructive' : status === 'em_andamento' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
