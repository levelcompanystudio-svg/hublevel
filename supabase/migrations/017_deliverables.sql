-- HubLevel migration 017: deliverables as a first-class, persistent entity (V2).

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text not null default 'medium',
  reference_month date,
  due_date date,
  completed_at timestamptz,
  assigned_to uuid references public.profiles(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint deliverables_status_check check (status in ('pending', 'in_progress', 'delivered', 'approved', 'overdue', 'canceled')),
  constraint deliverables_priority_check check (priority in ('low', 'medium', 'high', 'urgent'))
);

create trigger set_deliverables_updated_at
before update on public.deliverables
for each row execute function public.set_updated_at();

create index idx_deliverables_client_id on public.deliverables(client_id);
create index idx_deliverables_status on public.deliverables(status);
create index idx_deliverables_priority on public.deliverables(priority);
create index idx_deliverables_assigned_to on public.deliverables(assigned_to);
create index idx_deliverables_due_date on public.deliverables(due_date);
create index idx_deliverables_reference_month on public.deliverables(reference_month);
create index idx_deliverables_client_status on public.deliverables(client_id, status);
create index idx_deliverables_document_id on public.deliverables(document_id);
create index idx_deliverables_task_id on public.deliverables(task_id);

alter table public.deliverables enable row level security;

create policy "admin can manage deliverables"
on public.deliverables for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage deliverables for own clients"
on public.deliverables for all
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id) and deleted_at is null)
with check (public.is_gestor() and public.user_can_access_client(client_id));

create policy "colaborador can read own assigned deliverables"
on public.deliverables for select
to authenticated
using (public.is_colaborador() and assigned_to = auth.uid() and deleted_at is null);

create policy "colaborador can update own assigned deliverable status"
on public.deliverables for update
to authenticated
using (public.is_colaborador() and assigned_to = auth.uid() and deleted_at is null)
with check (public.is_colaborador() and assigned_to = auth.uid());
