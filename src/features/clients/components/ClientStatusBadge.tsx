import { Badge } from '../../../components/ui';
import type { ClientStatus } from '../clients.types';

const labels: Record<ClientStatus, string> = {
  onboarding: 'Onboarding',
  ativo: 'Ativo',
  pausado: 'Pausado',
  encerrado: 'Encerrado',
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const tone = status === 'ativo' ? 'success' : status === 'onboarding' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
