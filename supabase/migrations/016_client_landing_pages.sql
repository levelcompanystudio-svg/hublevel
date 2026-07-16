-- HubLevel migration 016: client landing page briefings (V1 persistent, no AI/publishing yet).

create table public.client_landing_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  status text not null default 'draft',
  display_name text,
  legal_name text,
  segment text,
  city text,
  state text,
  headline text,
  subheadline text,
  offer_description text,
  main_cta text,
  whatsapp text,
  contact_email text,
  primary_color text,
  secondary_color text,
  logo_url text,
  hero_image_url text,
  faq jsonb,
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint client_landing_pages_status_check check (status in ('draft', 'ready', 'published', 'archived'))
);

create trigger set_client_landing_pages_updated_at
before update on public.client_landing_pages
for each row execute function public.set_updated_at();

-- Um cliente pode ter no maximo uma landing page ativa (nao deletada) por vez.
create unique index idx_client_landing_pages_one_active_per_client
on public.client_landing_pages(client_id) where deleted_at is null;

create index idx_client_landing_pages_client_id on public.client_landing_pages(client_id);
create index idx_client_landing_pages_status on public.client_landing_pages(status);

alter table public.client_landing_pages enable row level security;

create policy "admin can manage client landing pages"
on public.client_landing_pages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read landing pages for own clients"
on public.client_landing_pages for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);

create policy "gestor can create landing pages for own clients"
on public.client_landing_pages for insert
to authenticated
with check (
  public.is_gestor()
  and public.user_can_access_client(client_id)
  and created_by = auth.uid()
);

create policy "gestor can update landing pages for own clients"
on public.client_landing_pages for update
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null)
with check (
  public.is_gestor()
  and public.user_can_access_client(client_id)
  and updated_by = auth.uid()
);
