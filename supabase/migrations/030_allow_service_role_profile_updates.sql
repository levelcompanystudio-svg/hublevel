-- HubLevel migration 030: allow service-role profile maintenance.
--
-- The profiles trigger protects normal users from changing role, status or
-- soft-delete fields. Edge Functions that manage users run with the Supabase
-- service role and must be able to perform those maintenance updates.

create or replace function public.enforce_profile_update_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if old.id <> auth.uid() then
    raise exception 'Only admins can update other profiles';
  end if;

  if new.id <> old.id
    or new.role_id <> old.role_id
    or new.email <> old.email
    or new.status <> old.status
    or new.deleted_at is distinct from old.deleted_at
    or new.deleted_by is distinct from old.deleted_by
  then
    raise exception 'Users can update only their own name';
  end if;

  return new;
end;
$$;
