import { Badge } from '../../../components/ui';
import type { BillingCycle } from '../services.types';

const labels: Record<BillingCycle, string> = {
  one_time: 'Unico',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

export function BillingCycleBadge({ cycle }: { cycle: BillingCycle | null }) {
  if (!cycle) return <Badge>Sem ciclo</Badge>;
  return <Badge tone="brand">{labels[cycle]}</Badge>;
}
