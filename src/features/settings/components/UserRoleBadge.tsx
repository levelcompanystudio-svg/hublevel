import { Badge } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';

const labels: Record<RoleName, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
};

export function UserRoleBadge({ role }: { role: RoleName }) {
  const tone = role === 'admin' ? 'brand' : role === 'gestor' ? 'success' : 'neutral';
  return <Badge tone={tone}>{labels[role]}</Badge>;
}
