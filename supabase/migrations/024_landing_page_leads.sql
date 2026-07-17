-- HubLevel migration 024: captura real de leads pela landing page publica.
-- Escrita (insert) so acontece via Edge Function `create-landing-page-lead` usando a service role
-- key no servidor - de proposito, NAO existe policy publica de insert nesta tabela.

create table public.landing_page_leads (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references public.client_landing_pages(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null,
  email text,
  phone text,
  message text,
  source text not null default 'landing_page',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  status text not null default 'novo',
  contacted_by uuid references public.profiles(id) on delete set null,
  contacted_at timestamptz,
  user_agent text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint landing_page_leads_status_check check (status in ('novo', 'contatado', 'qualificado', 'descartado')),
  constraint landing_page_leads_has_contact check (email is not null or phone is not null)
);

create index idx_landing_page_leads_client_id on public.landing_page_leads(client_id);
create index idx_landing_page_leads_landing_page_id on public.landing_page_leads(landing_page_id);
create index idx_landing_page_leads_status on public.landing_page_leads(status);
create index idx_landing_page_leads_created_at on public.landing_page_leads(created_at);

alter table public.landing_page_leads enable row level security;

create policy "admin can manage landing page leads"
on public.landing_page_leads for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read leads for own clients"
on public.landing_page_leads for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);

create policy "gestor can update lead status for own clients"
on public.landing_page_leads for update
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null)
with check (public.is_gestor() and public.user_can_access_client(client_id));

-- Nenhuma policy de insert para `authenticated`/`anon`: a unica forma de criar um lead e via
-- Edge Function publica usando a service role key (bypassa RLS de forma controlada e auditavel).
