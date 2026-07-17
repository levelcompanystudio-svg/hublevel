import { Badge } from '../../../components/ui';
import { integrationStatusLabels } from '../integrations.types';
import type { IntegrationStatus } from '../integrations.types';

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const tone = status === 'connected' ? 'success' : status === 'error' ? 'destructive' : status === 'pending' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{integrationStatusLabels[status]}</Badge>;
}
