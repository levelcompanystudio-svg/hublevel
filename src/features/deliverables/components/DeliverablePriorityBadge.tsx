import { Badge } from '../../../components/ui';
import type { DeliverablePriority } from '../deliverables.types';

const labels: Record<DeliverablePriority, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export function DeliverablePriorityBadge({ priority }: { priority: DeliverablePriority }) {
  const tone = priority === 'urgent' ? 'destructive' : priority === 'high' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{labels[priority]}</Badge>;
}
