/**
 * Types for HubLevel Authentication and user profiles.
 */

import type { User } from '@supabase/supabase-js';

export type UserStatus = 'active' | 'inactive';
export type RoleName = 'admin' | 'gestor' | 'colaborador';
export type ProfileType = 'internal' | 'external';

export interface UserProfile {
  id: string;
  role_id: string;
  name: string;
  email: string;
  status: UserStatus;
  profile_type: ProfileType;
  created_at: string;
  updated_at: string;
  roles?: {
    name: RoleName;
    description: string | null;
  };
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
