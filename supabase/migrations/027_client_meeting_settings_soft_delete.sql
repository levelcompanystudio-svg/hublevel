-- HubLevel migration 027: ajustes em public.client_meeting_settings.
-- Adiciona suporte a frequencia personalizada (numero de dias) e soft delete, seguindo o mesmo
-- padrao usado nas demais tabelas de dominio do projeto. Nao altera `meetings` nem `agenda_events`.

alter table public.client_meeting_settings
  add column custom_frequency_days integer,
  add column deleted_at timestamptz,
  add column deleted_by uuid references public.profiles(id) on delete set null;

alter table public.client_meeting_settings
  add constraint client_meeting_settings_custom_frequency_check check (
    frequency <> 'personalizada' or custom_frequency_days is not null
  );
