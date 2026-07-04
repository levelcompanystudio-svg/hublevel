# Supabase MCP

## 1. Objetivo da Integracao

Integrar MCP Supabase ao fluxo oficial Codex -> Claude -> Codex para permitir que assistentes trabalhem com contexto real do Supabase durante desenvolvimento, revisao e validacao.

O objetivo e permitir:

- Consulta de schema, tabelas, migrations e extensoes.
- Consulta de documentacao Supabase atualizada.
- Validacao de logs, advisors e diagnosticos.
- Geracao de tipos do banco.
- Aplicacao controlada de migrations em ambiente de desenvolvimento.
- Revisao tecnica pelo Codex antes de qualquer aprovacao final.

O ambiente Supabase `dev` ja foi criado. Esta documentacao nao configura uma conexao real. Todos os valores sensiveis devem permanecer fora do repositorio.

As credenciais reais devem existir apenas em `.env.local` ou no gerenciador seguro de variaveis do ambiente local/CI. Exemplos versionados devem usar somente placeholders.

## 2. Como Configurar

Configuracao recomendada para Claude em ambiente de desenvolvimento:

```powershell
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF&features=database,docs,development,debugging"
```

Depois de adicionar o servidor MCP, autenticar em um terminal normal:

```powershell
claude /mcp
```

Selecionar o servidor `supabase` e concluir o login no navegador.

Alternativa via `.mcp.json`, usando placeholder:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF&features=database,docs,development,debugging"
    }
  }
}
```

Se algum ambiente sem navegador exigir token, usar variaveis de ambiente fora do repositorio:

```text
SUPABASE_PROJECT_REF=preencher-localmente
SUPABASE_ACCESS_TOKEN=preencher-localmente
```

Nunca commitar esses valores.

Consulte tambem `docs/environment.md` para a estrutura oficial de variaveis locais.

## 3. URL MCP Para Claude

Claude deve usar MCP Supabase somente no ambiente Supabase `dev`, em projeto de desenvolvimento ou branch segura.

URL recomendada:

```text
https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF&features=database,docs,development,debugging
```

Permissoes esperadas para Claude:

- Consultar schema e tabelas.
- Consultar migrations.
- Consultar documentacao.
- Gerar tipos.
- Executar queries de validacao.
- Aplicar migrations somente com instrucao explicita do Codex.

Claude nao deve usar MCP em producao como padrao.

## 4. URL MCP Read-Only Para Codex

Codex deve usar MCP Supabase em modo read-only para revisao e auditoria do ambiente Supabase `dev`.

URL recomendada:

```text
https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF&read_only=true&features=database,docs,development,debugging
```

Permissoes esperadas para Codex:

- Consultar schema.
- Consultar migrations.
- Executar queries somente leitura.
- Consultar logs.
- Consultar advisors de seguranca e performance.
- Validar tipos e impacto arquitetural.

Codex nao deve aplicar migrations ou executar operacoes de escrita via MCP.

## 5. Regras de Seguranca

- Nunca usar producao como ambiente padrao.
- Sempre usar `project_ref`.
- Nunca commitar tokens, secrets, service role keys, senhas ou credenciais.
- Usar placeholders em arquivos versionados.
- Armazenar valores reais somente em `.env.local` ou variaveis de ambiente seguras.
- Manter aprovacao manual de chamadas MCP ativa quando disponivel.
- Claude so pode aplicar migrations quando houver instrucao explicita do Codex.
- Claude deve atuar somente em ambiente `dev` ou branch segura.
- Codex deve usar read-only para revisao.
- Dados reais ou sensiveis devem ser evitados em ambientes acessados por assistentes.
- Qualquer operacao destrutiva exige nova instrucao explicita do Codex.
- Account tools e operacoes de organizacao devem ficar fora do fluxo padrao.

## 6. Fluxo Codex -> Claude -> Codex

### Etapa 1: Codex Planeja

Codex define:

- Objetivo da tarefa.
- Escopo tecnico.
- Arquivos ou areas provaveis de alteracao.
- Regras de produto e arquitetura.
- Se Claude pode ou nao aplicar migrations.
- Criterios de aceite.
- Validacoes esperadas.

### Etapa 2: Claude Executa

Claude executa somente o que foi instruido pelo Codex.

Durante a execucao, Claude pode consultar MCP Supabase para entender schema, migrations, logs, docs e tipos. Claude so pode aplicar migrations quando a instrucao do Codex permitir explicitamente.

Depois de qualquer alteracao no banco, Claude deve informar:

- Migrations criadas ou aplicadas.
- Queries executadas.
- Arquivos alterados.
- Validacoes realizadas.
- Riscos ou pendencias encontradas.

### Etapa 3: Codex Revisa

Codex revisa a entrega antes da aprovacao final.

Codex deve verificar:

- `git diff`
- Migrations criadas ou alteradas.
- Schema via MCP read-only.
- Logs do Supabase.
- Advisors de seguranca e performance.
- Arquivos de tipos gerados.
- Compatibilidade com arquitetura, PRD e instrucoes originais.

Codex pode aprovar ou solicitar ajustes para Claude.

## 7. Checklist de Revisao

Antes de aprovar qualquer alteracao envolvendo Supabase, Codex deve conferir:

- A alteracao foi solicitada em uma instrucao clara do Codex.
- Claude atuou somente em ambiente `dev` ou branch segura.
- `project_ref` foi usado.
- Nenhum token ou secret foi commitado.
- Valores reais nao apareceram em documentacao, exemplos, commits ou logs.
- Migrations estao versionadas e legiveis.
- Migrations nao fazem mudancas destrutivas sem autorizacao explicita.
- Schema final corresponde ao objetivo da tarefa.
- Queries de validacao foram informadas.
- Logs nao indicam erro relevante.
- Advisors nao apontam problema critico de seguranca ou performance.
- Tipos gerados foram atualizados quando necessario.
- RLS, permissoes e indices foram considerados.
- `git diff` nao contem alteracoes fora do escopo.
- A entrega atende aos criterios de aceite.
