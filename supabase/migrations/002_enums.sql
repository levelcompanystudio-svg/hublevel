-- HubLevel migration 002: enum types.

create type public.user_status as enum ('active', 'inactive');
create type public.role_name as enum ('admin', 'gestor', 'colaborador');
create type public.permission_action as enum ('view', 'create', 'edit', 'delete', 'approve');

create type public.controlled_record_status as enum ('ativo', 'inativo');

create type public.client_status as enum ('onboarding', 'ativo', 'pausado', 'encerrado');
create type public.client_health_status as enum ('saudavel', 'atencao', 'critico');
create type public.client_service_status as enum ('ativo', 'pausado', 'encerrado');

create type public.contract_status as enum ('pendente', 'ativo', 'vencido', 'encerrado', 'cancelado');
create type public.document_type as enum ('contrato', 'proposta', 'briefing', 'relatorio', 'planejamento', 'comprovante', 'outro');

create type public.financial_record_status as enum ('previsto', 'pago', 'atrasado', 'cancelado');
create type public.payment_method as enum ('pix', 'boleto', 'cartao', 'transferencia', 'dinheiro', 'outro');

create type public.task_priority as enum ('baixa', 'media', 'alta', 'urgente');
create type public.task_status as enum ('a_fazer', 'em_andamento', 'aguardando_cliente', 'em_revisao', 'concluida', 'cancelada');

create type public.update_status as enum ('rascunho', 'registrada', 'enviada');

create type public.meeting_type as enum ('onboarding', 'alinhamento', 'performance', 'comercial', 'interna', 'outro');
create type public.meeting_status as enum ('agendada', 'realizada', 'cancelada', 'remarcada');

create type public.agenda_event_type as enum ('reuniao', 'tarefa', 'vencimento', 'follow_up', 'manual');
