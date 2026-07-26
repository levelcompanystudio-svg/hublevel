import { Badge } from '../../../components/ui';
import type { UpdateStatus } from '../updates.types';

export const updateStatusLabels: Record<UpdateStatus, string> = {
  rascunho: 'Rascunho',
  registrada: 'Registrada',
  enviada: 'Enviada',
};

export function UpdateStatusBadge({ status }: { status: UpdateStatus }) {
  const tone = status === 'enviada' ? 'success' : status === 'registrada' ? 'brand' : 'neutral';
  return <Badge tone={tone}>{updateStatusLabels[status]}</Badge>;
}
