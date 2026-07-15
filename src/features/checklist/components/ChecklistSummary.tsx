import { SummaryCard } from '../../../components/layout/SummaryCard';
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="Total" value={items.length} tone="brand" />
      <SummaryCard label="Pendentes" value={pendentes} />
      <SummaryCard label="Em andamento" value={emAndamento} tone="warning" />
      <SummaryCard label="Concluidos" value={concluidos} tone="success" />
      <SummaryCard label="Vencidos" value={vencidos} tone="warning" />
    </div>
  );
}
