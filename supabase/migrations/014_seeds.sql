-- HubLevel migration 014: initial seed data.

insert into public.roles (name, description)
values
  ('admin', 'Acesso administrativo completo'),
  ('gestor', 'Gestor responsavel por clientes e operacao'),
  ('colaborador', 'Usuario operacional com acesso limitado')
on conflict (name) do nothing;

insert into public.permissions (role_id, resource, action, allowed)
select r.id, resource, action::public.permission_action, true
from public.roles r
cross join (values
  ('profiles'), ('clients'), ('client_contacts'), ('client_health_history'),
  ('services'), ('client_services'), ('documents'), ('contracts'),
  ('financial_records'), ('payments'), ('tasks'), ('updates'), ('meetings'),
  ('agenda_events'), ('attachments'), ('comments'), ('settings'), ('activity_logs')
) resources(resource)
cross join (values ('view'), ('create'), ('edit'), ('delete'), ('approve')) actions(action)
where r.name = 'admin'
on conflict (role_id, resource, action) do nothing;

insert into public.permissions (role_id, resource, action, allowed)
select r.id, resource, action::public.permission_action, true
from public.roles r
cross join (values
  ('clients'), ('client_contacts'), ('client_health_history'), ('client_services'),
  ('documents'), ('tasks'), ('updates'), ('meetings'), ('agenda_events'),
  ('attachments'), ('comments')
) resources(resource)
cross join (values ('view'), ('create'), ('edit')) actions(action)
where r.name = 'gestor'
on conflict (role_id, resource, action) do nothing;

insert into public.permissions (role_id, resource, action, allowed)
select r.id, resource, action::public.permission_action, true
from public.roles r
cross join (values
  ('tasks'), ('meetings'), ('agenda_events'), ('comments')
) resources(resource)
cross join (values ('view'), ('edit')) actions(action)
where r.name = 'colaborador'
on conflict (role_id, resource, action) do nothing;

insert into public.acquisition_sources (name, description)
values
  ('Indicacao', 'Cliente vindo por indicacao'),
  ('Instagram', 'Cliente vindo pelo Instagram'),
  ('Google', 'Cliente vindo pelo Google'),
  ('Trafego pago', 'Cliente vindo por campanhas pagas'),
  ('Outbound', 'Cliente vindo por prospeccao ativa'),
  ('Networking', 'Cliente vindo por relacionamento/networking'),
  ('Cliente atual', 'Expansao ou indicacao de cliente atual'),
  ('Evento', 'Cliente vindo por evento'),
  ('Parceiro', 'Cliente vindo por parceiro'),
  ('Outro', 'Outra origem')
on conflict do nothing;

insert into public.services (name, description)
values
  ('Gestao de trafego', 'Gestao de campanhas de trafego pago'),
  ('Social media', 'Gestao de conteudo e redes sociais'),
  ('Criativos', 'Producao de criativos para campanhas e canais'),
  ('Landing page', 'Criacao ou manutencao de landing pages'),
  ('Consultoria', 'Consultoria estrategica ou operacional'),
  ('CRM/Funil', 'Estruturacao de CRM e funil comercial'),
  ('Relatorios', 'Relatorios de performance e acompanhamento'),
  ('Automacao', 'Automacoes comerciais ou operacionais'),
  ('Outro', 'Outro servico')
on conflict do nothing;

insert into public.settings (key, value, description)
values
  ('client_update_max_days', '7'::jsonb, 'Numero maximo de dias sem atualizacao do cliente'),
  ('client_meeting_recent_days', '30'::jsonb, 'Janela em dias para considerar reuniao recente'),
  ('default_billing_day', '10'::jsonb, 'Dia de vencimento padrao')
on conflict (key) do nothing;
