import type { RoleName } from '../../auth/auth.types';

export interface NavigationItem {
  path: string;
  label: string;
  description: string;
  icon: string;
  roles: RoleName[];
}
