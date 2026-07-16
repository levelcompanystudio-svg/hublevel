import { SummaryCard } from '../../../components/layout/SummaryCard';
import type { Deliverable } from '../deliverables.types';

interface DeliverableSummaryProps {
  items: Deliverable[];
}

export function DeliverableSummary({ items }: DeliverableSummaryProps) {
  const pending = items.filter((item) => item.status === 'pending' || item.status === 'in_progress').length;
  const delivered = items.filter((item) => item.status === 'delivered' || item.status === 'approved').length;
  const overdue = items.filter((item) => item.status === 'overdue').length;
  const urgent = items.filter((item) => item.priority === 'urgent').length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="Total" value={items.length} tone="brand" />
      <SummaryCard label="Pendentes" value={pending} />
      <SummaryCard label="Entregues" value={delivered} tone="success" />
      <SummaryCard label="Atrasados" value={overdue} tone="warning" />
      <SummaryCard label="Urgentes" value={urgent} tone="warning" />
    </div>
  );
}
