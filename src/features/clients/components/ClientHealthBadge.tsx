import { Badge } from '../../../components/ui';
import type { ClientHealthStatus } from '../clients.types';

const labels: Record<ClientHealthStatus, string> = {
  saudavel: 'Saudavel',
  atencao: 'Atencao',
  critico: 'Critico',
};

export function ClientHealthBadge({ status }: { status: ClientHealthStatus }) {
  const tone = status === 'saudavel' ? 'success' : status === 'atencao' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
