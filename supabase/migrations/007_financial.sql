-- HubLevel migration 007: financial records and payments.

create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  contract_id uuid references public.contracts(id) on delete restrict,
  competence_month date not null,
  description text,
  amount numeric(12,2) not null,
  due_date date not null,
  payment_date date,
  status public.financial_record_status not null default 'previsto',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint financial_records_amount_non_negative check (amount >= 0),
  constraint financial_records_competence_month_is_first_day check (competence_month = date_trunc('month', competence_month)::date)
);

create trigger set_financial_records_updated_at
before update on public.financial_records
for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  financial_record_id uuid not null references public.financial_records(id) on delete restrict,
  amount numeric(12,2) not null,
  paid_at timestamptz not null,
  method public.payment_method,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint payments_amount_positive check (amount > 0)
);

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();
