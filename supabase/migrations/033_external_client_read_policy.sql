-- HubLevel migration 033: allow external users to read their own linked clients (CRM Etapa 8).
--
-- Closes the gap documented in ExternalClientPortal.tsx: profile_type='external' users had no
-- SELECT policy on public.clients, so the portal could not show the real client name. This adds
-- exactly one new policy, reusing the existing helpers from migration 031
-- (is_external_user, user_has_client_membership) - no other policy, table or helper is touched.

create policy "external user can read own linked clients"
on public.clients for select
to authenticated
using (
  public.is_external_user()
  and deleted_at is null
  and public.user_has_client_membership(id)
);
