import { Badge } from '../../../components/ui';
import type { ClientServiceStatus } from '../client-services.types';

const labels: Record<ClientServiceStatus, string> = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  encerrado: 'Encerrado',
};

export function ClientServiceStatusBadge({ status }: { status: ClientServiceStatus }) {
  const tone = status === 'ativo' ? 'success' : status === 'pausado' ? 'warning' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
