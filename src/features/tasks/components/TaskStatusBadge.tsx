import { Badge } from '../../../components/ui';
import type { TaskStatus } from '../tasks.types';

const labels: Record<TaskStatus, string> = {
  a_fazer: 'Pendente',
  em_andamento: 'Em andamento',
  aguardando_cliente: 'Aguardando cliente',
  em_revisao: 'Em revisao',
  concluida: 'Concluida',
  cancelada: 'Cancelada',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone = status === 'concluida' ? 'success' : status === 'em_andamento' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

export { labels as taskStatusLabels };
