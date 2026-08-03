export type ExternalMembershipRole = 'client_viewer' | 'client_sales' | 'client_admin';
export type ExternalMembershipStatus = 'active' | 'suspended' | 'inactive';

export interface ExternalMembershipProfile {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface ExternalMembership {
  id: string;
  client_id: string;
  profile_id: string;
  membership_role: ExternalMembershipRole;
  status: ExternalMembershipStatus;
  can_view_all_opportunities: boolean;
  created_at: string;
  profile: ExternalMembershipProfile | null;
}

export interface ExternalProfileSearchResult {
  id: string;
  name: string;
  email: string;
}

export interface CreateExternalUserInput {
  client_id: string;
  name: string;
  email: string;
  password: string;
  membership_role: ExternalMembershipRole;
}

export interface LinkExistingExternalUserInput {
  client_id: string;
  profile_id: string;
  membership_role: ExternalMembershipRole;
}
