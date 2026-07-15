import { Badge } from '../../../components/ui';
import type { AlertSeverity } from '../alerts.types';

const labels: Record<AlertSeverity, string> = {
  alta: 'Alta prioridade',
  media: 'Media prioridade',
};

export function AlertPriorityBadge({ severity }: { severity: AlertSeverity }) {
  return <Badge tone={severity === 'alta' ? 'destructive' : 'warning'}>{labels[severity]}</Badge>;
}
