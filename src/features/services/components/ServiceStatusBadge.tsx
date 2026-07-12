import { Badge } from '../../../components/ui';
import type { ServiceStatus } from '../services.types';

const labels: Record<ServiceStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return <Badge tone={status === 'ativo' ? 'success' : 'neutral'}>{labels[status]}</Badge>;
}
