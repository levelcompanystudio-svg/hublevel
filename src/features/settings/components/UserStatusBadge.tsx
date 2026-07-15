import { Badge } from '../../../components/ui';
import type { UserStatus } from '../../auth/auth.types';

const labels: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={status === 'active' ? 'success' : 'neutral'}>{labels[status]}</Badge>;
}
