# Ambiente de Desenvolvimento

## Objetivo

Este documento define como registrar localmente as variaveis do ambiente Supabase `dev` sem expor credenciais no repositorio.

O ambiente Supabase de desenvolvimento ja existe. A documentacao do projeto deve usar apenas placeholders. Valores reais devem ficar apenas em arquivos locais ignorados pelo Git ou em gerenciadores seguros de secrets.

## Informacoes Coletadas

As seguintes informacoes do ambiente Supabase `dev` ja foram coletadas:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Nao registrar os valores reais em arquivos versionados.

## Onde Armazenar Localmente

Use este arquivo local:

```text
.env.local
```

O arquivo `.env.local` deve conter valores reais apenas na maquina de desenvolvimento. Ele nao deve ser commitado.

Use este arquivo versionado apenas como referencia:

```text
.env.example
```

O arquivo `.env.example` deve conter somente placeholders seguros.

## Estrutura do .env.local

Modelo local com placeholders:

```env
# Supabase dev
SUPABASE_ENV=dev
SUPABASE_PROJECT_REF=SUPABASE_PROJECT_REF_DEV
SUPABASE_URL=https://SUPABASE_PROJECT_REF_DEV.supabase.co
SUPABASE_PUBLISHABLE_KEY=SUPABASE_PUBLISHABLE_KEY_DEV

# Backend/admin only
SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY_DEV

# Direct Postgres connection, only when needed
SUPABASE_DB_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# MCP URLs, derived from project ref
SUPABASE_MCP_URL_CLAUDE=https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF_DEV&features=database,docs,development,debugging
SUPABASE_MCP_URL_CODEX=https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF_DEV&read_only=true&features=database,docs,development,debugging
```

## Preparacao Para MCP Supabase

Para preparar a futura integracao MCP sem expor secrets:

- Confirmar que `.env.local` esta ignorado pelo Git.
- Manter `.env.example` apenas com placeholders.
- Usar sempre `project_ref` nas URLs MCP.
- Usar `read_only=true` para Codex.
- Usar ambiente `dev` para Claude.
- Nao registrar tokens ou headers reais em `.mcp.json` versionado.
- Preferir autenticacao OAuth do Supabase no cliente MCP.
- Usar tokens somente em ambiente local seguro ou CI, quando indispensavel.

## Regras de Uso

- Claude so pode aplicar migrations quando houver instrucao explicita do Codex.
- Codex deve revisar operacoes Supabase em modo read-only.
- Nunca usar producao como padrao.
- Nunca commitar secrets, tokens, senhas, service role keys ou URLs de banco com senha.
- Depois de qualquer alteracao no banco, Claude deve informar migrations, queries, arquivos alterados e validacoes.
- Codex deve revisar via `git diff`, migrations, schema, logs e advisors.
