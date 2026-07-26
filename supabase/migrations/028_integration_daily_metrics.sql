-- HubLevel migration 028: metricas diarias normalizadas de integracoes de anuncios (Meta/Google).
-- Uma linha por (client_integration, dia). Escrita feita exclusivamente pelo servidor Node em
-- /server usando a service role key (sync manual/agendado) - nunca pelo frontend diretamente.
-- raw_metrics guarda a resposta original do provider (jsonb) para auditoria/depuracao, mesmo
-- depois de normalizar spend/impressions/clicks/etc nas colunas proprias.

create table public.integration_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  client_integration_id uuid not null references public.client_integrations(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  provider text not null,
  external_account_id text not null,
  metric_date date not null,
  spend numeric(14, 2) not null default 0,
  impressions bigint not null default 0,
  reach bigint not null default 0,
  clicks bigint not null default 0,
  ctr numeric(10, 4),
  cpc numeric(12, 4),
  cpm numeric(12, 4),
  leads bigint not null default 0,
  conversions bigint not null default 0,
  conversion_value numeric(14, 2) not null default 0,
  roas numeric(10, 4),
  currency_code text,
  raw_metrics jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint integration_daily_metrics_provider_check check (provider in ('meta_ads', 'google_ads')),
  constraint integration_daily_metrics_unique_per_day unique (client_integration_id, metric_date)
);

create index idx_integration_daily_metrics_client_id on public.integration_daily_metrics(client_id);
create index idx_integration_daily_metrics_client_integration_id on public.integration_daily_metrics(client_integration_id);
create index idx_integration_daily_metrics_metric_date on public.integration_daily_metrics(metric_date);
create index idx_integration_daily_metrics_provider on public.integration_daily_metrics(provider);

create trigger set_integration_daily_metrics_updated_at
before update on public.integration_daily_metrics
for each row execute function public.set_updated_at();

alter table public.integration_daily_metrics enable row level security;

create policy "admin can manage integration daily metrics"
on public.integration_daily_metrics for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read integration daily metrics for own clients"
on public.integration_daily_metrics for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);

-- Gestor nao tem policy de insert/update: a escrita destas metricas e sempre feita pelo servidor
-- Node via service role (sync com Meta/Google), nunca diretamente por um usuario autenticado.
