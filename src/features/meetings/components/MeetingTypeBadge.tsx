import { Badge } from '../../../components/ui';
import type { MeetingType } from '../meetings.types';

const labels: Record<MeetingType, string> = {
  onboarding: 'Onboarding',
  alinhamento: 'Alinhamento',
  performance: 'Performance',
  comercial: 'Comercial',
  interna: 'Interna',
  outro: 'Outro',
};

export function MeetingTypeBadge({ type }: { type: MeetingType }) {
  return <Badge tone={type === 'interna' ? 'neutral' : 'brand'}>{labels[type]}</Badge>;
}
