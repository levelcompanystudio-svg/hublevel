import { Badge } from '../../../components/ui';
import type { TaskPriority } from '../tasks.types';

export const taskPriorityLabels: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const tone = priority === 'urgente' ? 'destructive' : priority === 'alta' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{taskPriorityLabels[priority]}</Badge>;
}
