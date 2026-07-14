import { Badge } from '../../../components/ui';
import type { TaskPriority } from '../tasks.types';

const labels: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const tone = priority === 'urgente' ? 'destructive' : priority === 'alta' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{labels[priority]}</Badge>;
}
