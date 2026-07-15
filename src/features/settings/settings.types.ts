import type { RoleName, UserStatus } from '../auth/auth.types';

export interface RoleOption {
  id: string;
  name: RoleName;
  description: string | null;
}

export interface ManagedProfileRole {
  name: RoleName;
}

export interface ManagedProfile {
  id: string;
  role_id: string;
  name: string;
  email: string;
  status: UserStatus;
  created_at: string;
  roles?: ManagedProfileRole | ManagedProfileRole[] | null;
}
