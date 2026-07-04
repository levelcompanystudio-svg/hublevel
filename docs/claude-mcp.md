# Claude MCP

## Objetivo

Este documento define o plano tecnico de uso de MCPs pelo Claude neste projeto.

Nenhum MCP real deve ser configurado por este documento. Todas as URLs, tokens, owners, repositorios e IDs devem usar placeholders em arquivos versionados.

## 1. MCPs Que Claude Deve Utilizar

### Supabase

Uso principal:

- Consultar schema, tabelas, extensoes e migrations.
- Consultar documentacao Supabase.
- Gerar tipos a partir do banco.
- Validar queries em ambiente `dev`.
- Aplicar migrations somente quando Codex autorizar explicitamente.

Ambiente permitido:

- Apenas Supabase `dev`.
- Nunca producao como padrao.
- Sempre com `project_ref`.

### Git/GitHub

Uso principal:

- Consultar issues autorizadas pelo Codex.
- Relacionar alteracoes a uma tarefa planejada.
- Ler contexto de PRs, quando existirem.
- Consultar historico relevante.
- Preparar resumo de alteracoes para revisao.

Claude nao deve fazer merge, criar release, alterar configuracoes do repositorio ou mudar protecoes de branch sem aprovacao explicita do Codex.

### Filesystem/Projeto Local

Uso principal:

- Ler arquivos do projeto.
- Criar e alterar codigo conforme instrucao do Codex.
- Criar componentes, paginas, testes e migrations.
- Atualizar documentacao quando a tarefa pedir.

Restricao:

- Claude deve alterar apenas arquivos dentro do escopo definido pelo Codex.

### Outros MCPs Recomendados

Outros MCPs podem ser adicionados futuramente, mas devem seguir a mesma regra de menor permissao possivel:

- Browser/Playwright MCP: testar fluxos locais, telas e interacoes.
- Docs MCP: consultar documentacao oficial de frameworks usados pelo projeto.
- Package/Registry MCP: consultar pacotes e versoes quando a stack for definida.
- Design/Figma MCP: somente se houver design oficial do produto.

Nenhum MCP adicional deve ser ativado sem registro neste documento e aprovacao do Codex.

## 2. Como Claude Deve Ser Configurado Localmente

Configuracao local recomendada:

1. Instalar e autenticar Claude Code localmente.
2. Configurar MCPs no escopo do projeto, nao global, sempre que possivel.
3. Usar `.mcp.json` com placeholders quando o arquivo for versionado.
4. Guardar secrets reais fora do repositorio.
5. Usar OAuth do provedor quando disponivel.
6. Manter aprovacao manual de tool calls ativa.
7. Validar conexoes somente em ambiente `dev`.

Exemplo de comando para Supabase dev:

```powershell
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF_DEV&features=database,docs,development,debugging"
```

Autenticacao:

```powershell
claude /mcp
```

Selecionar o servidor MCP e autenticar pelo fluxo oficial do provedor.

## 3. Estrutura Recomendada do .mcp.json

Se o projeto usar `.mcp.json`, manter apenas placeholders.

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=SUPABASE_PROJECT_REF_DEV&features=database,docs,development,debugging"
    },
    "github": {
      "type": "http",
      "url": "GITHUB_MCP_SERVER_URL_PLACEHOLDER"
    },
    "docs": {
      "type": "http",
      "url": "DOCS_MCP_SERVER_URL_PLACEHOLDER"
    }
  }
}
```

Se algum MCP exigir header, token ou secret, nao registrar valor real no arquivo:

```json
{
  "mcpServers": {
    "example": {
      "type": "http",
      "url": "EXAMPLE_MCP_SERVER_URL_PLACEHOLDER",
      "headers": {
        "Authorization": "Bearer ENV_VAR_PLACEHOLDER"
      }
    }
  }
}
```

Valores reais devem ficar em `.env.local`, variaveis de ambiente locais, gerenciador de secrets ou configuracao segura do cliente MCP.

## 4. Permissoes de Cada MCP

### Supabase MCP

Permitido para Claude:

- Ler schema.
- Listar tabelas.
- Listar migrations.
- Consultar documentacao.
- Gerar tipos.
- Executar queries de validacao em `dev`.
- Aplicar migrations em `dev` somente com instrucao explicita do Codex.

Proibido para Claude sem aprovacao explicita:

- Aplicar migrations.
- Executar alteracoes destrutivas.
- Alterar dados sensiveis.
- Usar producao.
- Fazer deploy de Edge Functions.
- Alterar Storage, Auth ou configuracoes globais.

### Git/GitHub MCP

Permitido para Claude:

- Ler issues e contexto autorizado.
- Consultar historico e metadados do repositorio.
- Preparar resumo de mudancas.
- Referenciar issues na entrega.

Proibido para Claude sem aprovacao explicita:

- Fazer merge.
- Criar release.
- Alterar branch protection.
- Alterar secrets do GitHub.
- Fechar issues sem revisao.
- Aprovar PR.
- Fazer force push.

### Filesystem/Projeto Local

Permitido para Claude:

- Ler arquivos do projeto.
- Editar arquivos dentro do escopo.
- Criar testes, componentes, paginas, migrations e documentacao solicitada.

Proibido para Claude sem aprovacao explicita:

- Remover arquivos fora do escopo.
- Alterar configuracoes sensiveis.
- Mover arquitetura principal.
- Trocar stack tecnica.
- Instalar dependencias novas sem justificativa aprovada.

### Browser/Playwright MCP

Permitido para Claude:

- Testar app local.
- Validar telas e fluxos.
- Capturar erros de console.

Proibido para Claude sem aprovacao explicita:

- Acessar ambientes de producao.
- Executar acoes destrutivas em sistemas reais.
- Fazer login com contas pessoais sem autorizacao.

## 5. O Que Claude Pode Executar Sozinho

Claude pode executar sozinho apenas tarefas que estejam dentro de uma instrucao clara do Codex, como:

- Implementar componentes.
- Criar paginas.
- Refatorar codigo dentro do escopo.
- Criar testes.
- Corrigir bugs definidos.
- Consultar MCPs para contexto.
- Rodar validacoes locais.
- Gerar tipos Supabase, se a tarefa permitir.
- Preparar migrations sem aplicar, quando o Codex nao autorizou aplicacao.

Claude deve parar e reportar quando encontrar necessidade de mudar escopo, arquitetura, seguranca ou dados.

## 6. O Que Exige Aprovacao Previa do Codex

Exige aprovacao previa do Codex:

- Aplicar migrations.
- Alterar schema do banco.
- Alterar RLS, policies, Auth, Storage ou Edge Functions.
- Instalar dependencias.
- Trocar stack, framework ou arquitetura.
- Fazer operacoes destrutivas.
- Usar MCP em qualquer ambiente que nao seja `dev`.
- Criar, fechar ou reorganizar issues em lote.
- Fazer push, merge, release ou alterar configuracao do GitHub.
- Alterar arquivos de configuracao sensiveis.
- Introduzir secrets, tokens ou credenciais em qualquer arquivo.

## 7. Fluxo Operacional

### 1. Codex Planeja

Codex define:

- Objetivo.
- Escopo.
- Arquivos provaveis.
- MCPs permitidos.
- Permissoes permitidas.
- Se migrations podem ser aplicadas.
- Criterios de aceite.
- Validacoes obrigatorias.

### 2. Claude Executa

Claude executa somente a instrucao do Codex.

Claude pode consultar MCPs permitidos para reunir contexto, implementar, refatorar, testar e preparar artefatos.

### 3. Claude Reporta Alteracoes

Ao concluir, Claude deve reportar:

- Arquivos alterados.
- MCPs usados.
- Queries executadas.
- Migrations criadas ou aplicadas.
- Testes e validacoes rodadas.
- Problemas encontrados.
- Pontos que exigem decisao do Codex.

### 4. Codex Revisa

Codex revisa:

- `git diff`
- Arquivos alterados.
- Migrations.
- Schema via MCP read-only, quando houver Supabase.
- Logs e advisors.
- Testes.
- Aderencia ao PRD, arquitetura e instrucao original.

### 5. Codex Aprova

Codex pode:

- Aprovar a entrega.
- Solicitar ajustes para Claude.
- Bloquear a entrega por risco tecnico, seguranca ou desalinhamento de produto.

Nenhuma implementacao deve ser considerada finalizada antes da aprovacao do Codex.

## Checklist Para Ativar MCP No Futuro

- `.env.local` existe apenas localmente.
- `.env.example` contem apenas placeholders.
- `.mcp.json`, se existir, contem apenas placeholders.
- Supabase usa `project_ref`.
- Codex usa read-only.
- Claude usa apenas `dev`.
- Tool calls exigem aprovacao manual.
- Nenhum secret aparece em `git diff`.
- O fluxo Codex -> Claude -> Codex esta documentado na tarefa.
