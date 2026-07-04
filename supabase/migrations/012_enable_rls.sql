-- HubLevel migration 012: enable RLS on all public application tables.

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.profiles enable row level security;

alter table public.acquisition_sources enable row level security;
alter table public.services enable row level security;
alter table public.settings enable row level security;

alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.client_health_history enable row level security;
alter table public.client_services enable row level security;

alter table public.documents enable row level security;
alter table public.contracts enable row level security;
alter table public.attachments enable row level security;

alter table public.financial_records enable row level security;
alter table public.payments enable row level security;

alter table public.tasks enable row level security;
alter table public.updates enable row level security;
alter table public.meetings enable row level security;
alter table public.agenda_events enable row level security;
alter table public.comments enable row level security;

alter table public.activity_logs enable row level security;
