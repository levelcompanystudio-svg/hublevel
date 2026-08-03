import { Badge } from '../../../components/ui';
import type { ExternalMembershipStatus } from '../externalAccess.types';

const STATUS_CONFIG: Record<ExternalMembershipStatus, { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Ativo', tone: 'success' },
  suspended: { label: 'Suspenso', tone: 'warning' },
  inactive: { label: 'Inativo', tone: 'neutral' },
};

// Fonte unica de labels/ordem para o badge e para o select de status em ExternalMembershipTable.
export const EXTERNAL_MEMBERSHIP_STATUS_OPTIONS: Array<{ value: ExternalMembershipStatus; label: string }> = (
  Object.keys(STATUS_CONFIG) as ExternalMembershipStatus[]
).map((status) => ({ value: status, label: STATUS_CONFIG[status].label }));

export function ExternalMembershipStatusBadge({ status }: { status: ExternalMembershipStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
