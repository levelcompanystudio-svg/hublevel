-- HubLevel migration 006: documents, contracts, and attachments.

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  type public.document_type not null,
  title text not null,
  description text,
  external_url text,
  file_url text,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint documents_has_url check (external_url is not null or file_url is not null)
);

create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  document_id uuid references public.documents(id) on delete set null,
  status public.contract_status not null default 'pendente',
  start_date date not null,
  end_date date,
  monthly_value numeric(12,2) not null,
  billing_day integer not null,
  notice_period_days integer,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint contracts_monthly_value_non_negative check (monthly_value >= 0),
  constraint contracts_billing_day_range check (billing_day between 1 and 31),
  constraint contracts_notice_period_non_negative check (notice_period_days is null or notice_period_days >= 0),
  constraint contracts_end_date_after_start_date check (end_date is null or end_date >= start_date)
);

create trigger set_contracts_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  file_url text not null,
  file_name text,
  file_type text,
  uploaded_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_attachments_updated_at
before update on public.attachments
for each row execute function public.set_updated_at();
