import { KpiStrip } from '../../../components/layout/KpiStrip';
import { getChecklistBucket } from '../checklist.types';
import type { ChecklistItem } from '../checklist.types';

interface ChecklistSummaryProps {
  items: ChecklistItem[];
}

export function ChecklistSummary({ items }: ChecklistSummaryProps) {
  const buckets = items.map(getChecklistBucket);
  const pendentes = buckets.filter((bucket) => bucket === 'pendente').length;
  const emAndamento = buckets.filter((bucket) => bucket === 'em_andamento').length;
  const concluidos = buckets.filter((bucket) => bucket === 'concluido').length;
  const vencidos = buckets.filter((bucket) => bucket === 'vencido').length;

  return (
    <KpiStrip
      items={[
        { label: 'Total', value: items.length, tone: 'brand' },
        { label: 'Pendentes', value: pendentes, tone: 'neutral' },
        { label: 'Em andamento', value: emAndamento, tone: 'warning' },
        { label: 'Concluidos', value: concluidos, tone: 'success' },
        { label: 'Vencidos', value: vencidos, tone: 'warning' },
      ]}
    />
  );
}
