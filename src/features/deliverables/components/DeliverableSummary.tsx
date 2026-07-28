import { KpiStrip } from '../../../components/layout/KpiStrip';
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
    <KpiStrip
      items={[
        { label: 'Total', value: items.length, tone: 'brand' },
        { label: 'Pendentes', value: pending, tone: 'neutral' },
        { label: 'Entregues', value: delivered, tone: 'success' },
        { label: 'Atrasados', value: overdue, tone: overdue > 0 ? 'warning' : 'neutral' },
        { label: 'Urgentes', value: urgent, tone: urgent > 0 ? 'warning' : 'neutral' },
      ]}
    />
  );
}
