-- HubLevel migration 010: indexes and partial unique constraints.

create index idx_profiles_role_id on public.profiles(role_id);
create index idx_profiles_status on public.profiles(status);
create index idx_profiles_email on public.profiles(email);

create index idx_permissions_role_id on public.permissions(role_id);
create index idx_permissions_resource_action on public.permissions(resource, action);

create unique index idx_acquisition_sources_name_active_unique on public.acquisition_sources(lower(name)) where deleted_at is null;
create index idx_acquisition_sources_status on public.acquisition_sources(status);

create unique index idx_services_name_active_unique on public.services(lower(name)) where deleted_at is null;
create index idx_services_status on public.services(status);

create index idx_clients_responsible_user_id on public.clients(responsible_user_id);
create index idx_clients_status on public.clients(status);
create index idx_clients_health_status on public.clients(health_status);
create index idx_clients_acquisition_source_id on public.clients(acquisition_source_id);
create index idx_clients_created_at on public.clients(created_at);
create index idx_clients_deleted_at on public.clients(deleted_at);

create index idx_client_contacts_client_id on public.client_contacts(client_id);
create index idx_client_contacts_client_primary on public.client_contacts(client_id, is_primary);
create unique index idx_client_contacts_one_primary_per_client on public.client_contacts(client_id) where is_primary = true and deleted_at is null;

create index idx_client_health_client_id on public.client_health_history(client_id);
create index idx_client_health_created_at on public.client_health_history(created_at);
create index idx_client_health_client_created on public.client_health_history(client_id, created_at);

create index idx_client_services_client_id on public.client_services(client_id);
create index idx_client_services_service_id on public.client_services(service_id);
create index idx_client_services_status on public.client_services(status);
create index idx_client_services_client_status on public.client_services(client_id, status);
create unique index idx_client_services_one_active_service on public.client_services(client_id, service_id) where status = 'ativo' and deleted_at is null;

create index idx_documents_client_id on public.documents(client_id);
create index idx_documents_type on public.documents(type);
create index idx_documents_created_by on public.documents(created_by_user_id);
create index idx_documents_client_type on public.documents(client_id, type);

create index idx_contracts_client_id on public.contracts(client_id);
create index idx_contracts_status on public.contracts(status);
create index idx_contracts_end_date on public.contracts(end_date);
create index idx_contracts_document_id on public.contracts(document_id);
create index idx_contracts_client_status on public.contracts(client_id, status);

create index idx_financial_records_client_id on public.financial_records(client_id);
create index idx_financial_records_contract_id on public.financial_records(contract_id);
create index idx_financial_records_status on public.financial_records(status);
create index idx_financial_records_due_date on public.financial_records(due_date);
create index idx_financial_records_competence_month on public.financial_records(competence_month);
create index idx_financial_records_client_competence on public.financial_records(client_id, competence_month);
create index idx_financial_records_client_status on public.financial_records(client_id, status);
create unique index idx_financial_records_unique_contract_competence on public.financial_records(client_id, contract_id, competence_month) where contract_id is not null and deleted_at is null;
create unique index idx_financial_records_unique_client_competence_without_contract on public.financial_records(client_id, competence_month) where contract_id is null and deleted_at is null;

create index idx_payments_financial_record_id on public.payments(financial_record_id);
create index idx_payments_paid_at on public.payments(paid_at);

create index idx_tasks_client_id on public.tasks(client_id);
create index idx_tasks_assigned_to_user_id on public.tasks(assigned_to_user_id);
create index idx_tasks_created_by_user_id on public.tasks(created_by_user_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_priority on public.tasks(priority);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_assigned_status on public.tasks(assigned_to_user_id, status);
create index idx_tasks_client_status on public.tasks(client_id, status);

create index idx_updates_client_id on public.updates(client_id);
create index idx_updates_responsible_user_id on public.updates(responsible_user_id);
create index idx_updates_status on public.updates(status);
create index idx_updates_update_date on public.updates(update_date);
create index idx_updates_client_update_date on public.updates(client_id, update_date);

create index idx_meetings_client_id on public.meetings(client_id);
create index idx_meetings_scheduled_at on public.meetings(scheduled_at);
create index idx_meetings_status on public.meetings(status);
create index idx_meetings_created_by on public.meetings(created_by_user_id);
create index idx_meetings_client_scheduled on public.meetings(client_id, scheduled_at);
create index idx_meetings_participants_gin on public.meetings using gin(participants);

create index idx_agenda_events_client_id on public.agenda_events(client_id);
create index idx_agenda_events_responsible_user_id on public.agenda_events(responsible_user_id);
create index idx_agenda_events_start_at on public.agenda_events(start_at);
create index idx_agenda_events_type on public.agenda_events(type);
create index idx_agenda_events_related on public.agenda_events(related_entity_type, related_entity_id);

create index idx_attachments_entity on public.attachments(entity_type, entity_id);
create index idx_attachments_uploaded_by_user_id on public.attachments(uploaded_by_user_id);

create index idx_comments_entity on public.comments(entity_type, entity_id);
create index idx_comments_user_id on public.comments(user_id);

create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at);
