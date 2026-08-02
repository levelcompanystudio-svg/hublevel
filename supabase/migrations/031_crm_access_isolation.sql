-- HubLevel migration 031: CRM access architecture and per-client data isolation (Etapa 1).
--
-- Introduces profile_type (internal/external) and client_user_memberships, plus RLS helpers
-- to let external client users see only their own client's data later, when the CRM UI ships.
-- No CRM tables (contacts, opportunities, pipeline) are created here - foundation only.

-- 1. profiles.profile_type ----------------------------------------------------------------
-- Existing rows all become 'internal' via the column default; no existing role/user changes.

alter table public.profiles
  add column profile_type text not null default 'internal';

alter table public.profiles
  add constraint profiles_profile_type_check
  check (profile_type in ('internal', 'external'));

-- Guard profile_type the same way role_id/email/status/deleted_at are already guarded, so a
-- non-admin cannot self-promote/demote between internal and external via "users can update own
-- name" (migration 013). Redefines the function introduced in 011 and last updated in 030,
-- preserving the service_role bypass added there - only the guarded-fields list changes.
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
    or new.profile_type <> old.profile_type
    or new.deleted_at is distinct from old.deleted_at
    or new.deleted_by is distinct from old.deleted_by
  then
    raise exception 'Users can update only their own name';
  end if;

  return new;
end;
$$;

-- 2. client_user_memberships ---------------------------------------------------------------
-- Links a profile (internal or external) to a client with a CRM-scoped role. No global
-- "cliente" role is created - membership_role is local to this table only.

create table public.client_user_memberships (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  membership_role text not null,
  status text not null default 'active',
  can_view_all_opportunities boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint client_user_memberships_role_check check (membership_role in (
    'level_admin',
    'level_manager',
    'level_collaborator',
    'client_admin',
    'client_sales',
    'client_viewer'
  )),
  constraint client_user_memberships_status_check check (status in ('active', 'suspended', 'inactive'))
);

create trigger set_client_user_memberships_updated_at
before update on public.client_user_memberships
for each row execute function public.set_updated_at();

-- Partial unique: one non-deleted membership per (client_id, profile_id). A profile can be
-- re-invited to the same client only after the previous membership is soft-deleted.
create unique index idx_client_user_memberships_unique_active
  on public.client_user_memberships(client_id, profile_id)
  where deleted_at is null;

create index idx_client_user_memberships_client_id on public.client_user_memberships(client_id);
create index idx_client_user_memberships_profile_id on public.client_user_memberships(profile_id);
create index idx_client_user_memberships_status on public.client_user_memberships(status);
create index idx_client_user_memberships_role on public.client_user_memberships(membership_role);

-- 3. RLS helpers -----------------------------------------------------------------------------

create or replace function public.current_profile_type()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.profile_type
  from public.profiles p
  where p.id = auth.uid()
    and p.status = 'active'
    and p.deleted_at is null
  limit 1;
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_type() = 'internal';
$$;

create or replace function public.is_external_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_type() = 'external';
$$;

create or replace function public.user_has_client_membership(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_user_memberships m
    where m.client_id = target_client_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
  );
$$;

-- true for: internal admin; internal gestor responsible for the client; internal colaborador
-- with an active membership; or external user with an active membership.
create or replace function public.user_can_access_crm_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or (
      public.is_gestor()
      and exists (
        select 1
        from public.clients c
        where c.id = target_client_id
          and c.deleted_at is null
          and c.responsible_user_id = auth.uid()
      )
    )
    or (
      public.is_colaborador()
      and public.user_has_client_membership(target_client_id)
    )
    or (
      public.is_external_user()
      and public.user_has_client_membership(target_client_id)
    );
$$;

-- true for: internal admin; internal gestor responsible for the client; or an active membership
-- with a management-level role (level_admin, level_manager, client_admin).
create or replace function public.user_can_manage_crm_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or (
      public.is_gestor()
      and exists (
        select 1
        from public.clients c
        where c.id = target_client_id
          and c.deleted_at is null
          and c.responsible_user_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.client_user_memberships m
      where m.client_id = target_client_id
        and m.profile_id = auth.uid()
        and m.status = 'active'
        and m.deleted_at is null
        and m.membership_role in ('level_admin', 'level_manager', 'client_admin')
    );
$$;

-- 4. RLS on client_user_memberships ---------------------------------------------------------
-- Policies query public.clients/public.client_user_memberships directly (not through the CRM
-- helpers above) to keep evaluation simple and avoid any risk of recursive RLS evaluation.

alter table public.client_user_memberships enable row level security;

create policy "admin can manage client user memberships"
on public.client_user_memberships for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read memberships for own clients"
on public.client_user_memberships for select
to authenticated
using (
  public.is_gestor()
  and deleted_at is null
  and exists (
    select 1
    from public.clients c
    where c.id = client_user_memberships.client_id
      and c.deleted_at is null
      and c.responsible_user_id = auth.uid()
  )
);

create policy "gestor can create memberships for own clients"
on public.client_user_memberships for insert
to authenticated
with check (
  public.is_gestor()
  and membership_role <> 'level_admin'
  and exists (
    select 1
    from public.clients c
    where c.id = client_user_memberships.client_id
      and c.deleted_at is null
      and c.responsible_user_id = auth.uid()
  )
);

create policy "gestor can update memberships for own clients"
on public.client_user_memberships for update
to authenticated
using (
  public.is_gestor()
  and deleted_at is null
  and exists (
    select 1
    from public.clients c
    where c.id = client_user_memberships.client_id
      and c.deleted_at is null
      and c.responsible_user_id = auth.uid()
  )
)
with check (
  public.is_gestor()
  and membership_role <> 'level_admin'
  and exists (
    select 1
    from public.clients c
    where c.id = client_user_memberships.client_id
      and c.deleted_at is null
      and c.responsible_user_id = auth.uid()
  )
);

create policy "external user can read own membership"
on public.client_user_memberships for select
to authenticated
using (
  public.is_external_user()
  and profile_id = auth.uid()
  and deleted_at is null
);

-- No policy is created for colaborador (internal) access to this table: colaboradores manage
-- memberships nowhere in this etapa, and CRM entity access for them goes through
-- user_can_access_crm_client()/user_has_client_membership(), not through reading this table
-- directly. External users get no insert/update/delete policy either, so RLS's default-deny
-- blocks any membership self-modification for them.
