-- HubLevel migration 022: base real de integracoes por cliente (Meta Ads / Google Ads).
-- Sem OAuth, sem tokens/credenciais, sem chamada a API externa e sem sincronizacao real ainda —
-- apenas a estrutura de status por cliente/provedor e o historico de tentativas de sincronizacao.

create table public.client_integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  provider text not null,
  status text not null default 'not_connected',
  external_account_id text,
  external_account_name text,
  last_sync_at timestamptz,
  error_message text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint client_integrations_provider_check check (provider in ('meta_ads', 'google_ads')),
  constraint client_integrations_status_check check (status in ('not_connected', 'pending', 'connected', 'error'))
);

create trigger set_client_integrations_updated_at
before update on public.client_integrations
for each row execute function public.set_updated_at();

-- No maximo uma integracao ativa por cliente/provedor.
create unique index idx_client_integrations_one_active_per_client_provider
on public.client_integrations(client_id, provider) where deleted_at is null;

create index idx_client_integrations_client_id on public.client_integrations(client_id);
create index idx_client_integrations_provider on public.client_integrations(provider);
create index idx_client_integrations_status on public.client_integrations(status);

create table public.integration_sync_logs (
  id uuid primary key default gen_random_uuid(),
  client_integration_id uuid not null references public.client_integrations(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  provider text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  message text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint integration_sync_logs_provider_check check (provider in ('meta_ads', 'google_ads')),
  constraint integration_sync_logs_status_check check (status in ('success', 'failed', 'pending'))
);

create index idx_integration_sync_logs_client_integration_id on public.integration_sync_logs(client_integration_id);
create index idx_integration_sync_logs_client_id on public.integration_sync_logs(client_id);
create index idx_integration_sync_logs_started_at on public.integration_sync_logs(started_at);

alter table public.client_integrations enable row level security;
alter table public.integration_sync_logs enable row level security;

create policy "admin can manage client integrations"
on public.client_integrations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read integrations for own clients"
on public.client_integrations for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);

create policy "gestor can update integrations for own clients"
on public.client_integrations for update
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null)
with check (
  public.is_gestor()
  and public.user_can_access_client(client_id)
  and updated_by = auth.uid()
);

create policy "admin can manage integration sync logs"
on public.integration_sync_logs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read sync logs for own clients"
on public.integration_sync_logs for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);
