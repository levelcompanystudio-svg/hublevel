-- HubLevel migration 011: helper functions for RLS policies.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.current_user_role()
returns public.role_name
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and p.status = 'active'
    and p.deleted_at is null
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.is_gestor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'gestor';
$$;

create or replace function public.is_colaborador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'colaborador';
$$;

create or replace function public.user_can_access_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.clients c
      where c.id = target_client_id
        and c.deleted_at is null
        and public.is_gestor()
        and c.responsible_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.tasks t
      where t.client_id = target_client_id
        and t.deleted_at is null
        and t.assigned_to_user_id = auth.uid()
    );
$$;

create or replace function public.user_can_access_task(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.tasks t
      join public.clients c on c.id = t.client_id
      where t.id = target_task_id
        and t.deleted_at is null
        and c.deleted_at is null
        and public.is_gestor()
        and c.responsible_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.tasks t
      where t.id = target_task_id
        and t.deleted_at is null
        and t.assigned_to_user_id = auth.uid()
    );
$$;

create or replace function public.enforce_profile_update_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
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

create trigger enforce_profile_update_rules
before update on public.profiles
for each row execute function public.enforce_profile_update_rules();
