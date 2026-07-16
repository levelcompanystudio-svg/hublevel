import { Badge } from '../../../components/ui';
import type { DeliverableOrigin } from './deliverables-legacy.types';

const labels: Record<DeliverableOrigin, string> = {
  tarefa: 'Tarefa',
  documento: 'Documento',
  update: 'Atualizacao',
};

export function DeliverableOriginBadge({ origin }: { origin: DeliverableOrigin }) {
  return <Badge>{labels[origin]}</Badge>;
}
