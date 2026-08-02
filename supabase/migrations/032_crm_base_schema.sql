-- HubLevel migration 032: CRM base schema (Etapa 3 - pipelines, stages, contacts, opportunities).
--
-- Physical foundation only: no frontend, no routes, no Kanban. RLS reuses the CRM access
-- helpers from migration 031 (user_can_access_crm_client / user_can_manage_crm_client) so
-- internal and external users are gated by the same client-scoped membership rules that
-- already exist - no new access model is introduced here.
--
-- NOT APPLIED to Supabase yet - local migration file only, per instruction.

-- 1. crm_pipelines --------------------------------------------------------------------------

create table public.crm_pipelines (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null,
  status text not null default 'active',
  is_default boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint crm_pipelines_status_check check (status in ('active', 'inactive'))
);

create trigger set_crm_pipelines_updated_at
before update on public.crm_pipelines
for each row execute function public.set_updated_at();

create index idx_crm_pipelines_client_id on public.crm_pipelines(client_id);
create index idx_crm_pipelines_status on public.crm_pipelines(status);

-- Inferred invariant (not explicitly requested, flagged in the report): at most one default,
-- non-deleted pipeline per client, matching the existing idx_client_contacts_one_primary_per_client
-- pattern for "is_primary"-style flags in this schema.
create unique index idx_crm_pipelines_one_default_per_client
  on public.crm_pipelines(client_id)
  where is_default = true and deleted_at is null;

-- 2. crm_pipeline_stages --------------------------------------------------------------------

create table public.crm_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.crm_pipelines(id) on delete restrict,
  name text not null,
  position integer not null,
  probability integer,
  status text not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint crm_pipeline_stages_status_check check (status in ('active', 'inactive')),
  -- Inferred invariant (not explicitly requested, flagged in the report): probability is a
  -- percentage when present.
  constraint crm_pipeline_stages_probability_range check (probability is null or (probability between 0 and 100))
);

create trigger set_crm_pipeline_stages_updated_at
before update on public.crm_pipeline_stages
for each row execute function public.set_updated_at();

create index idx_crm_pipeline_stages_pipeline_id on public.crm_pipeline_stages(pipeline_id);
create index idx_crm_pipeline_stages_status on public.crm_pipeline_stages(status);
create index idx_crm_pipeline_stages_pipeline_position on public.crm_pipeline_stages(pipeline_id, position);

-- 3. crm_contacts ----------------------------------------------------------------------------

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null,
  email text,
  phone text,
  company_name text,
  position text,
  status text not null default 'active',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint crm_contacts_status_check check (status in ('active', 'inactive'))
);

create trigger set_crm_contacts_updated_at
before update on public.crm_contacts
for each row execute function public.set_updated_at();

create index idx_crm_contacts_client_id on public.crm_contacts(client_id);
create index idx_crm_contacts_status on public.crm_contacts(status);

-- 4. crm_opportunities -----------------------------------------------------------------------

create table public.crm_opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  pipeline_id uuid not null references public.crm_pipelines(id) on delete restrict,
  stage_id uuid not null references public.crm_pipeline_stages(id) on delete restrict,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  title text not null,
  value numeric(12,2),
  status text not null default 'open',
  source text,
  expected_close_date date,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint crm_opportunities_status_check check (status in ('open', 'won', 'lost', 'archived')),
  -- Inferred invariant (not explicitly requested, flagged in the report): a deal value can't be
  -- negative, matching client_services.monthly_value's existing check.
  constraint crm_opportunities_value_non_negative check (value is null or value >= 0)
);

create trigger set_crm_opportunities_updated_at
before update on public.crm_opportunities
for each row execute function public.set_updated_at();

create index idx_crm_opportunities_client_id on public.crm_opportunities(client_id);
create index idx_crm_opportunities_pipeline_id on public.crm_opportunities(pipeline_id);
create index idx_crm_opportunities_stage_id on public.crm_opportunities(stage_id);
create index idx_crm_opportunities_contact_id on public.crm_opportunities(contact_id);
create index idx_crm_opportunities_owner_profile_id on public.crm_opportunities(owner_profile_id);
create index idx_crm_opportunities_status on public.crm_opportunities(status);
create index idx_crm_opportunities_client_status on public.crm_opportunities(client_id, status);

-- Integrity guard for the denormalized opportunity shape:
-- - pipeline_id must belong to the same client_id
-- - stage_id must belong to the same pipeline_id
-- - contact_id, when present, must belong to the same client_id
-- This keeps RLS simple (client_id on opportunities) without allowing cross-client references.
create or replace function public.validate_crm_opportunity_relationships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.crm_pipelines p
    where p.id = new.pipeline_id
      and p.client_id = new.client_id
      and p.deleted_at is null
  ) then
    raise exception 'Opportunity pipeline must belong to the same client';
  end if;

  if not exists (
    select 1
    from public.crm_pipeline_stages s
    where s.id = new.stage_id
      and s.pipeline_id = new.pipeline_id
      and s.deleted_at is null
  ) then
    raise exception 'Opportunity stage must belong to the selected pipeline';
  end if;

  if new.contact_id is not null and not exists (
    select 1
    from public.crm_contacts c
    where c.id = new.contact_id
      and c.client_id = new.client_id
      and c.deleted_at is null
  ) then
    raise exception 'Opportunity contact must belong to the same client';
  end if;

  return new;
end;
$$;

create trigger validate_crm_opportunity_relationships
before insert or update on public.crm_opportunities
for each row execute function public.validate_crm_opportunity_relationships();

-- 5. RLS ---------------------------------------------------------------------------------------
-- select: user_can_access_crm_client(client_id). insert/update: user_can_manage_crm_client(client_id).
-- No delete policy anywhere in this migration - hard DELETE is denied by RLS default-deny for
-- every role; removal is soft delete only (update deleted_at/deleted_by, already covered by the
-- update policies below). No service-role-specific policy is added.

alter table public.crm_pipelines enable row level security;
alter table public.crm_pipeline_stages enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_opportunities enable row level security;

-- crm_pipelines: client_id lives on the table itself.
create policy "crm access can read pipelines"
on public.crm_pipelines for select
to authenticated
using (public.user_can_access_crm_client(client_id));

create policy "crm manage can insert pipelines"
on public.crm_pipelines for insert
to authenticated
with check (public.user_can_manage_crm_client(client_id));

create policy "crm manage can update pipelines"
on public.crm_pipelines for update
to authenticated
using (public.user_can_manage_crm_client(client_id))
with check (public.user_can_manage_crm_client(client_id));

-- crm_pipeline_stages: no client_id column, so client scope is resolved via the parent pipeline.
create policy "crm access can read pipeline stages"
on public.crm_pipeline_stages for select
to authenticated
using (
  exists (
    select 1
    from public.crm_pipelines p
    where p.id = crm_pipeline_stages.pipeline_id
      and p.deleted_at is null
      and public.user_can_access_crm_client(p.client_id)
  )
);

create policy "crm manage can insert pipeline stages"
on public.crm_pipeline_stages for insert
to authenticated
with check (
  exists (
    select 1
    from public.crm_pipelines p
    where p.id = crm_pipeline_stages.pipeline_id
      and p.deleted_at is null
      and public.user_can_manage_crm_client(p.client_id)
  )
);

create policy "crm manage can update pipeline stages"
on public.crm_pipeline_stages for update
to authenticated
using (
  exists (
    select 1
    from public.crm_pipelines p
    where p.id = crm_pipeline_stages.pipeline_id
      and p.deleted_at is null
      and public.user_can_manage_crm_client(p.client_id)
  )
)
with check (
  exists (
    select 1
    from public.crm_pipelines p
    where p.id = crm_pipeline_stages.pipeline_id
      and p.deleted_at is null
      and public.user_can_manage_crm_client(p.client_id)
  )
);

-- crm_contacts: client_id lives on the table itself.
create policy "crm access can read contacts"
on public.crm_contacts for select
to authenticated
using (public.user_can_access_crm_client(client_id));

create policy "crm manage can insert contacts"
on public.crm_contacts for insert
to authenticated
with check (public.user_can_manage_crm_client(client_id));

create policy "crm manage can update contacts"
on public.crm_contacts for update
to authenticated
using (public.user_can_manage_crm_client(client_id))
with check (public.user_can_manage_crm_client(client_id));

-- crm_opportunities: client_id lives on the table itself (denormalized alongside pipeline_id/
-- stage_id, as specified), so no join is needed for its own policies.
create policy "crm access can read opportunities"
on public.crm_opportunities for select
to authenticated
using (public.user_can_access_crm_client(client_id));

create policy "crm manage can insert opportunities"
on public.crm_opportunities for insert
to authenticated
with check (public.user_can_manage_crm_client(client_id));

create policy "crm manage can update opportunities"
on public.crm_opportunities for update
to authenticated
using (public.user_can_manage_crm_client(client_id))
with check (public.user_can_manage_crm_client(client_id));
