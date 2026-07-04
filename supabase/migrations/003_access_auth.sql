-- HubLevel migration 003: roles, permissions, profiles, and auth profile bootstrap.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.role_name not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete restrict,
  resource text not null,
  action public.permission_action not null,
  allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_unique_role_resource_action unique (role_id, resource, action)
);

create trigger set_permissions_updated_at
before update on public.permissions
for each row execute function public.set_updated_at();

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  name text not null,
  email text not null unique,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  default_role_id uuid;
  fallback_name text;
begin
  select id into default_role_id
  from public.roles
  where name = 'colaborador'
  limit 1;

  if default_role_id is null then
    raise exception 'Default role colaborador not found';
  end if;

  fallback_name = coalesce(
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1),
    'Usuario'
  );

  insert into public.profiles (id, role_id, name, email, status)
  values (new.id, default_role_id, fallback_name, new.email, 'active')
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
