import { Badge } from '../../../components/ui';
import type { ExternalMembershipRole } from '../externalAccess.types';

const ROLE_CONFIG: Record<ExternalMembershipRole, { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive' }> = {
  client_viewer: { label: 'Visualizador', tone: 'neutral' },
  client_sales: { label: 'Comercial', tone: 'brand' },
  client_admin: { label: 'Admin do cliente', tone: 'warning' },
};

// Fonte unica de labels/ordem para o badge e para o select de papel em ExternalMembershipTable e
// ExternalUserForm.
export const EXTERNAL_MEMBERSHIP_ROLE_OPTIONS: Array<{ value: ExternalMembershipRole; label: string }> = (
  Object.keys(ROLE_CONFIG) as ExternalMembershipRole[]
).map((role) => ({ value: role, label: ROLE_CONFIG[role].label }));

export function ExternalMembershipRoleBadge({ role }: { role: ExternalMembershipRole }) {
  const config = ROLE_CONFIG[role];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
