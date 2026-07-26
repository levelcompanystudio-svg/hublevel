-- HubLevel migration 026: configuracao operacional de reunioes por cliente.
-- Uma linha 1:1 por cliente com a cadencia esperada de reunioes (frequencia, semana prevista,
-- status operacional e pos-reuniao). Nao substitui `meetings` (que continua sendo o registro real
-- de cada encontro) - esta tabela guarda apenas o "plano"/configuracao usado pela tela /app/reunioes
-- para montar uma linha por cliente ativo, mesmo quando ainda nao existe nenhuma reuniao agendada.

create table public.client_meeting_settings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients(id) on delete restrict,
  frequency text not null default 'mensal',
  expected_week text not null default 'sem_definicao',
  operational_status text not null default 'cliente_novo',
  post_meeting_status text not null default 'indisponivel',
  created_by uuid not null references public.profiles(id) on delete restrict,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_meeting_settings_frequency_check check (
    frequency in ('semanal', 'quinzenal', 'mensal', '45_dias', '60_dias', 'personalizada')
  ),
  constraint client_meeting_settings_expected_week_check check (
    expected_week in ('semana_1', 'semana_2', 'semana_3', 'semana_4', 'sem_definicao')
  ),
  constraint client_meeting_settings_operational_status_check check (
    operational_status in (
      'indisponivel', 'cliente_novo', 'agendar_semana', 'agendada', 'realizada', 'aguardando_retorno'
    )
  ),
  constraint client_meeting_settings_post_meeting_status_check check (
    post_meeting_status in ('indisponivel', 'pendente', 'feito')
  )
);

create index idx_client_meeting_settings_client_id on public.client_meeting_settings(client_id);
create index idx_client_meeting_settings_operational_status on public.client_meeting_settings(operational_status);
create index idx_client_meeting_settings_expected_week on public.client_meeting_settings(expected_week);

create trigger set_client_meeting_settings_updated_at
before update on public.client_meeting_settings
for each row execute function public.set_updated_at();

alter table public.client_meeting_settings enable row level security;

create policy "admin can manage client meeting settings"
on public.client_meeting_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "gestor can manage settings for own clients"
on public.client_meeting_settings for all
to authenticated
using (public.is_gestor() and public.user_can_access_client(client_id))
with check (public.is_gestor() and public.user_can_access_client(client_id));

-- Colaborador nao tem nenhuma policy nesta tabela: sem acesso ao modulo global de reunioes,
-- por padrao (RLS nega tudo que nao tem policy correspondente).
