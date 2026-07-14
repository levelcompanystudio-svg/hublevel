import { Badge } from '../../../components/ui';
import type { MeetingStatus } from '../meetings.types';

const labels: Record<MeetingStatus, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  remarcada: 'Remarcada',
};

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  const tone =
    status === 'realizada' ? 'success' : status === 'agendada' ? 'brand' : status === 'remarcada' ? 'warning' : 'destructive';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}
