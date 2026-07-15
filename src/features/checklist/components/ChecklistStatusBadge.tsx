import { Badge } from '../../../components/ui';
import type { ChecklistBucket } from '../checklist.types';

const labels: Record<ChecklistBucket, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluido',
  vencido: 'Vencido',
};

export function ChecklistStatusBadge({ bucket }: { bucket: ChecklistBucket }) {
  const tone =
    bucket === 'concluido' ? 'success' : bucket === 'vencido' ? 'destructive' : bucket === 'em_andamento' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{labels[bucket]}</Badge>;
}
