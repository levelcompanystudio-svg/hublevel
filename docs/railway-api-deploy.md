# Deploy do HubLevel API (/server) no Railway

## 1. Objetivo

Rodar o backend `/server` (Node + Fastify + TypeScript, integracoes Meta/Google Ads) como um servico separado no Railway, distinto do frontend Vite. Este documento nao executa nenhum deploy - e o roteiro para quem tiver acesso ao Railway seguir manualmente.

Nenhum valor real (token, chave, URL de projeto) deve ser commitado neste arquivo ou em qualquer outro arquivo versionado. Use sempre placeholders aqui; os valores reais ficam somente nas variaveis de ambiente do servico no Railway.

## 2. Servico

- **Nome do servico**: `hublevel-api`
- **Root directory**: `/server`
- **Build command**: `npm install && npm run build`
- **Start command**: `npm run start`
- **Health check path**: `/health` (publico, sem autenticacao - confirmado em `server/src/routes/health.ts`)
- **Porta**: o Railway injeta `PORT` automaticamente; o servidor ja le `process.env.PORT` via `server/src/env.ts` e escuta em `0.0.0.0` (`server/src/index.ts`) - nao e preciso configurar porta manualmente.

## 3. Variaveis de ambiente privadas obrigatorias

Configurar direto no painel do servico `hublevel-api` no Railway (nunca em arquivo versionado):

| Variavel | Descricao |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase (mesmo projeto do frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key - uso exclusivo do servidor, nunca no frontend |
| `META_SYSTEM_USER_TOKEN` | Token do system user do Business Meta (permissao `ads_read`, no minimo) |
| `META_API_VERSION` | Versao da Graph API usada pelo cliente Meta (ex.: `v21.0`) |

## 4. Variaveis de ambiente opcionais

| Variavel | Descricao |
|---|---|
| `META_APP_ID` | Usado so para compor `appsecret_proof` junto com `META_APP_SECRET` |
| `META_APP_SECRET` | Idem - sem essas duas, o cliente Meta funciona normalmente, so sem esse reforco de seguranca |
| `GOOGLE_CLIENT_ID` | Reservado para quando o Google Ads real for implementado |
| `GOOGLE_CLIENT_SECRET` | Idem |

`NODE_ENV` pode ser setado como `production` no Railway (o schema de env em `server/src/env.ts` aceita `development` / `production` / `test`, com default `development`).

## 5. Como obter a URL publica do servico

1. No painel do servico `hublevel-api` no Railway, abrir a aba **Settings > Networking**.
2. Gerar (ou copiar, se ja existir) o **dominio publico** do servico (formato `https://hublevel-api-production.up.railway.app` ou dominio customizado, se configurado).
3. Essa URL e a que vai para `VITE_HUBLEVEL_SERVER_URL` no frontend - nunca aponte o frontend para o dominio interno privado do Railway (`*.railway.internal`), que so e alcancavel entre servicos do mesmo projeto Railway.

## 6. Como configurar VITE_HUBLEVEL_SERVER_URL no frontend

- **Local (`.env.local`)**: `VITE_HUBLEVEL_SERVER_URL=http://localhost:4000` (ja configurado - aponta pro `/server` rodando localmente).
- **Frontend hospedado (Railway/Vercel/outro)**: configurar `VITE_HUBLEVEL_SERVER_URL` como variavel de ambiente do servico de frontend, com o valor da URL publica obtida no passo 5 (sem barra final). Como e uma variavel `VITE_*`, ela e embutida no bundle em tempo de build - qualquer alteracao exige um novo build/deploy do frontend.
- Confirme que o valor e sempre a URL publica (nunca um secret) - `src/lib/env.ts` so usa essa variavel para montar a base das chamadas em `src/lib/serverClient.ts`, nunca para autenticacao.

## 7. Revisao de prontidao do /server para Railway

Checado no codigo atual (sem alteracoes necessarias nesta etapa):

- [x] Le a porta via `env.PORT` (`server/src/env.ts`, default `4000`, mas o Railway sempre injeta a sua propria `PORT`).
- [x] Escuta em `0.0.0.0` (`server/src/index.ts`: `app.listen({ port: env.PORT, host: '0.0.0.0' })`).
- [x] `npm run build` gera `dist/` via `tsc -p tsconfig.json` (`server/package.json`).
- [x] `npm run start` roda `node dist/index.js`.
- [x] `GET /health` responde sem autenticacao (nenhum `preHandler` nessa rota, diferente das rotas de integracao que exigem `requireAdmin`).
- [x] Nenhum secret hardcoded no codigo - tudo lido via `server/src/env.ts` a partir de variaveis de ambiente.
- [x] `server/.env.example` documenta todas as variaveis (privadas e opcionais) com placeholders, nunca valores reais.
- [x] `.gitignore` da raiz ja cobre `node_modules/`, `dist/` e `.env*` para qualquer subpasta, incluindo `/server` (confirmado via `git status --ignored`).

Conclusao: o `/server` esta pronto para deploy no Railway sem nenhuma alteracao de codigo.

## 8. Checklist de teste real (pos-deploy)

Para quem tiver acesso real ao Railway e a um token Meta valido:

1. Subir o servico `hublevel-api` no Railway com as variaveis da secao 3 (obrigatorias) e, se disponivel, as da secao 4.
2. Testar `GET https://<url-publica>/health` (sem header de autenticacao) - deve responder `{"status":"ok","timestamp":"..."}`.
3. Configurar `VITE_HUBLEVEL_SERVER_URL` no servico de frontend com a URL publica do `hublevel-api` (secao 6) e rodar um novo deploy do frontend.
4. Logar no HubLevel como usuario **admin**.
5. Abrir um cliente > aba **Integracoes**.
6. Clicar em **Conectar** no card Meta Ads.
7. Validar que a listagem de contas Meta Ads acessiveis pelo `META_SYSTEM_USER_TOKEN` aparece corretamente (sem erro de rede/autenticacao).
8. Selecionar uma conta e confirmar o vinculo (**Vincular conta**) - o card deve passar para status "Conectado".
9. Clicar em **Sincronizar agora** e aguardar a resposta de sucesso.
10. Verificar no Supabase (dev) que `public.integration_daily_metrics` recebeu linhas para o `client_integration_id` correspondente, com `spend`/`impressions`/`clicks`/etc preenchidos e `raw_metrics` com a resposta bruta da Meta.
11. Abrir a aba **Metricas** do mesmo cliente e `/app/performance` e confirmar que os cards (Investimento, Leads, CPL, ROAS, Cliques) deixam de mostrar "Sem dados" e passam a refletir os numeros sincronizados.
12. Conferir o Dashboard (`/app/dashboard`) - a secao Performance deve trocar o placeholder "Nenhuma integracao conectada" pelos totais agregados.

Nenhum destes passos foi executado nesta etapa (sem acesso ao Railway nem a um `META_SYSTEM_USER_TOKEN` real neste ambiente) - fica registrado como checklist para quem for aplicar o deploy de fato.
