-- HubLevel migration 029: campos de suporte a sync real em public.client_integrations.
-- credentials_reference NUNCA guarda o token em si (o token do Meta system user vive so no env
-- privado do servidor Node) - e apenas uma referencia/rotulo nao sensivel de qual credencial de
-- servidor foi usada para essa conexao, util para auditoria caso existam multiplos system users
-- no futuro.

alter table public.client_integrations
  add column credentials_reference text,
  add column last_success_at timestamptz,
  add column last_error_code text,
  add column last_error_at timestamptz,
  add column currency_code text,
  add column timezone text;
