-- HubLevel migration 004: controlled catalogs and settings.

create table public.acquisition_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status public.controlled_record_status not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_acquisition_sources_updated_at
before update on public.acquisition_sources
for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status public.controlled_record_status not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  updated_by_user_id uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger set_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();
