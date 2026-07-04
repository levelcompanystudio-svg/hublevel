-- HubLevel migration 005: clients and client-related domain tables.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  trade_name text,
  document_number text,
  segment text,
  acquisition_source_id uuid references public.acquisition_sources(id) on delete set null,
  status public.client_status not null default 'onboarding',
  responsible_user_id uuid not null references public.profiles(id) on delete restrict,
  health_status public.client_health_status not null default 'saudavel',
  start_date date,
  end_date date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint clients_end_date_after_start_date check (end_date is null or start_date is null or end_date >= start_date)
);

create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null,
  role text,
  email text,
  phone text,
  whatsapp text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_client_contacts_updated_at
before update on public.client_contacts
for each row execute function public.set_updated_at();

create table public.client_health_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  status public.client_health_status not null,
  reason text,
  notes text,
  changed_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.client_services (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  status public.client_service_status not null default 'ativo',
  monthly_value numeric(12,2),
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint client_services_monthly_value_non_negative check (monthly_value is null or monthly_value >= 0),
  constraint client_services_end_date_after_start_date check (end_date is null or start_date is null or end_date >= start_date)
);

create trigger set_client_services_updated_at
before update on public.client_services
for each row execute function public.set_updated_at();
