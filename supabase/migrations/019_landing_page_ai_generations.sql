-- HubLevel migration 019: AI-generated landing page copy (content generation only,
-- no publishing, no public preview, no lead capture).

create table public.landing_page_ai_generations (
  id uuid primary key default gen_random_uuid(),
  client_landing_page_id uuid not null references public.client_landing_pages(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  status text not null default 'generated',
  provider text not null default 'openai',
  model text,
  prompt_version text not null default 'v1',
  input_snapshot jsonb not null,
  generated_content jsonb not null,
  error_message text,
  generated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint landing_page_ai_generations_status_check check (status in ('generated', 'approved', 'discarded', 'failed'))
);

create index idx_landing_page_ai_generations_client_id on public.landing_page_ai_generations(client_id);
create index idx_landing_page_ai_generations_landing_page_id on public.landing_page_ai_generations(client_landing_page_id);
create index idx_landing_page_ai_generations_status on public.landing_page_ai_generations(status);
create index idx_landing_page_ai_generations_created_at on public.landing_page_ai_generations(created_at);

alter table public.landing_page_ai_generations enable row level security;

create policy "admin can manage landing page ai generations"
on public.landing_page_ai_generations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can read ai generations for own clients"
on public.landing_page_ai_generations for select
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null);

create policy "gestor can create ai generations for own clients"
on public.landing_page_ai_generations for insert
to authenticated
with check (
  public.is_gestor()
  and public.user_can_access_client(client_id)
  and generated_by = auth.uid()
);
