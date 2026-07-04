-- HubLevel migration 009: audit support.

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  summary text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
