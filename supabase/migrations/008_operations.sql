-- HubLevel migration 008: operational work tables and comments.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete restrict,
  title text not null,
  description text,
  assigned_to_user_id uuid references public.profiles(id) on delete set null,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  priority public.task_priority not null default 'media',
  status public.task_status not null default 'a_fazer',
  due_date date,
  category text,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  description text not null,
  category text,
  responsible_user_id uuid not null references public.profiles(id) on delete restrict,
  status public.update_status not null default 'registrada',
  update_date date not null,
  next_action text,
  sent_to_client boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_updates_updated_at
before update on public.updates
for each row execute function public.set_updated_at();

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete restrict,
  title text not null,
  type public.meeting_type not null default 'alinhamento',
  scheduled_at timestamptz not null,
  status public.meeting_status not null default 'agendada',
  participants jsonb,
  agenda text,
  notes text,
  decisions text,
  next_steps text,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_meetings_updated_at
before update on public.meetings
for each row execute function public.set_updated_at();

create table public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.agenda_event_type not null,
  related_entity_type text,
  related_entity_id uuid,
  client_id uuid references public.clients(id) on delete restrict,
  responsible_user_id uuid references public.profiles(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  constraint agenda_events_end_after_start check (end_at is null or end_at >= start_at),
  constraint agenda_events_related_pair check (
    (related_entity_type is null and related_entity_id is null)
    or (related_entity_type is not null and related_entity_id is not null)
  )
);

create trigger set_agenda_events_updated_at
before update on public.agenda_events
for each row execute function public.set_updated_at();

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete restrict,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();
