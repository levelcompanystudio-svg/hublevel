# Git/GitHub MCP

## Objetivo

Este documento define o plano tecnico para uso de MCP Git/GitHub no projeto HubLevel.

Nenhuma conexao MCP real deve ser configurada por este documento. Todas as URLs, tokens, owners, repositorios, branch names externos e IDs sensiveis devem usar placeholders em arquivos versionados.

O fluxo oficial continua sendo:

```text
Codex planeja -> Claude executa -> Claude reporta -> Codex revisa -> Codex aprova
```

## 1. Beneficios

- Centralizar contexto de issues, branches, commits e pull requests.
- Reduzir risco de Claude trabalhar fora do escopo definido pelo Codex.
- Permitir rastreabilidade entre tarefa, branch, commit e PR.
- Facilitar auditoria de alteracoes por `git diff`, historico e metadados do GitHub.
- Padronizar commits, revisoes e merges.
- Manter Codex como aprovador final antes de qualquer merge.

## 2. Casos de Uso

### Para Claude

- Ler issues aprovadas pelo Codex.
- Consultar historico relevante.
- Verificar branch atual.
- Preparar commits locais dentro do escopo.
- Criar resumo de alteracoes para revisao.
- Abrir PR em modo rascunho quando Codex autorizar.

### Para Codex

- Criar e priorizar issues.
- Definir escopo da branch.
- Revisar diff, commits e PR.
- Validar arquitetura, testes e seguranca.
- Aprovar ou solicitar ajustes.
- Autorizar merge.

## 3. Seguranca

Regras obrigatorias:

- Nunca commitar tokens, secrets, chaves privadas ou credenciais.
- Nunca registrar valores reais de GitHub tokens em `.mcp.json`, docs ou exemplos.
- Usar placeholders em arquivos versionados.
- Manter aprovacao manual de tool calls ativa quando o cliente permitir.
- Nao permitir force push sem aprovacao explicita do Codex.
- Nao permitir merge automatico sem revisao final do Codex.
- Nao permitir alteracao de branch protection, secrets, actions, ambientes ou permissoes sem aprovacao explicita.
- Preferir tokens com escopo minimo quando MCP real for configurado.
- Separar permissoes de leitura e escrita quando possivel.

## 4. Permissoes

### Permissoes Recomendadas Para Claude

Permitido:

- Ler issues, PRs, commits e branches.
- Ler arquivos e historico.
- Criar branch de trabalho quando Codex instruir.
- Criar commits locais dentro do escopo.
- Fazer push da branch de trabalho quando Codex autorizar.
- Abrir PR draft quando Codex autorizar.
- Atualizar descricao do PR com resumo tecnico.

Proibido sem aprovacao previa do Codex:

- Fazer merge.
- Fechar issues.
- Criar release ou tag.
- Fazer force push.
- Apagar branches remotas.
- Alterar branch protection.
- Alterar GitHub Actions, environments ou secrets.
- Alterar configuracao do repositorio.
- Aprovar PR.
- Reverter commits compartilhados.

### Permissoes Recomendadas Para Codex

Permitido:

- Criar e organizar issues.
- Definir roadmap e milestones.
- Revisar branches, commits e PRs.
- Solicitar ajustes.
- Aprovar entrega.
- Autorizar merge.

Codex tambem deve evitar operacoes destrutivas sem confirmacao explicita do usuario.

## 5. Fluxo de Branches

Branch principal:

```text
main
```

Branches de trabalho:

```text
feature/issue-id-descricao-curta
fix/issue-id-descricao-curta
docs/issue-id-descricao-curta
chore/issue-id-descricao-curta
refactor/issue-id-descricao-curta
```

Exemplos com placeholders:

```text
feature/ISSUE_ID-clientes-crud
fix/ISSUE_ID-login-redirect
docs/ISSUE_ID-git-mcp
```

Regras:

- `main` deve representar o estado aprovado.
- Claude nao deve trabalhar direto em `main`.
- Cada tarefa deve ter uma branch propria.
- Branches devem ter escopo pequeno e rastreavel.
- Branches antigas devem ser removidas apenas apos merge aprovado.

## 6. Fluxo de Commits

Claude deve criar commits pequenos e coerentes quando autorizado.

Convencao recomendada:

```text
tipo(escopo): descricao curta
```

Tipos permitidos:

- `feat`: nova funcionalidade.
- `fix`: correcao de bug.
- `docs`: documentacao.
- `refactor`: refatoracao sem mudanca funcional.
- `test`: testes.
- `chore`: manutencao.
- `build`: build, dependencias ou tooling.
- `db`: migrations, schema ou dados estruturais.

Exemplos:

```text
docs(mcp): document git github workflow
feat(clients): add client list view
db(clients): add initial client tables
fix(auth): handle missing session
```

Regras:

- Um commit deve representar uma unidade logica.
- Nao misturar refatoracao ampla com funcionalidade.
- Nao commitar arquivos gerados fora do padrao do projeto.
- Nao commitar `.env.local`, tokens, secrets, dumps ou logs sensiveis.
- Mensagens devem ser em ingles tecnico curto ou portugues padronizado; escolher uma convencao por fase do projeto.

## 7. Pull Requests

PRs devem ser usados para revisao antes de merge em `main`.

Template recomendado:

```markdown
## Objetivo

Descrever a tarefa e o problema resolvido.

## Alteracoes

- Arquivo/modulo alterado
- Comportamento novo ou corrigido

## Validacoes

- Comando executado
- Resultado

## MCPs usados

- Supabase: sim/nao
- Git/GitHub: sim/nao
- Outros: listar

## Banco de dados

- Migrations criadas/aplicadas: sim/nao
- Queries executadas: listar ou informar nenhuma

## Riscos

- Riscos conhecidos
- Pontos pendentes

## Checklist

- [ ] Escopo respeitado
- [ ] Sem secrets no diff
- [ ] Testes/validacoes executados
- [ ] Documentacao atualizada, se necessario
- [ ] Pronto para revisao do Codex
```

Regras:

- Claude pode preparar PR draft somente quando Codex autorizar.
- PR nao deve ser marcado pronto para merge sem revisao do Codex.
- PR deve linkar issue ou instrucao original.
- PR deve explicar qualquer alteracao de banco, seguranca ou arquitetura.

## 8. Processo de Revisao

Codex revisa antes de aprovar.

Checklist de revisao:

- Escopo corresponde a instrucao original.
- `git diff` nao contem alteracoes fora do escopo.
- Arquivos sensiveis nao foram alterados indevidamente.
- Nenhum secret foi commitado.
- Commits estao coerentes.
- Testes/validacoes foram executados.
- Arquitetura continua alinhada ao PRD.
- Migrations, se houver, sao seguras e revisaveis.
- RLS/permissoes foram consideradas quando houver banco.
- PR possui resumo claro.

Resultados possiveis:

- Aprovar.
- Solicitar ajustes para Claude.
- Bloquear por risco tecnico, seguranca ou desalinhamento.

## 9. Auditoria

Todo trabalho relevante deve deixar rastro auditavel:

- Issue ou instrucao do Codex.
- Branch de trabalho.
- Commits relacionados.
- PR com resumo.
- Validacoes executadas.
- Revisao do Codex.
- Decisao final de aprovacao ou ajuste.

Itens de auditoria obrigatorios:

- Data e autor das alteracoes.
- Arquivos alterados.
- Commits incluidos.
- Migrations criadas ou aplicadas.
- MCPs usados.
- Confirmacao de ausencia de secrets.

## 10. Integracao Com o Fluxo Oficial

### 1. Codex Planeja

Codex define:

- Objetivo.
- Issue ou tarefa.
- Branch sugerida.
- Escopo tecnico.
- Arquivos provaveis.
- MCPs permitidos.
- Se Claude pode criar commit, push ou PR.
- Criterios de aceite.
- Validacoes obrigatorias.

### 2. Claude Executa

Claude:

- Cria ou usa a branch autorizada.
- Executa apenas o escopo definido.
- Usa Git/GitHub MCP apenas nas permissoes autorizadas.
- Prepara commits pequenos, se autorizado.
- Nao faz merge.

### 3. Claude Reporta

Claude deve reportar:

- Branch usada.
- Commits criados.
- Arquivos alterados.
- Issues/PRs relacionados.
- MCPs usados.
- Testes e validacoes executadas.
- Riscos e pendencias.

### 4. Codex Revisa

Codex revisa:

- `git status`
- `git diff`
- Historico de commits.
- PR, se existir.
- Checks e testes.
- Migrations e alteracoes sensiveis.
- Aderencia ao escopo e arquitetura.

### 5. Codex Aprova

Codex pode:

- Aprovar e autorizar merge.
- Solicitar ajustes.
- Recusar merge por risco.

Merge so deve acontecer apos aprovacao final do Codex.

## O Que Claude Pode Fazer Sozinho

Claude pode fazer sozinho, dentro de uma instrucao do Codex:

- Ler issues e contexto.
- Consultar historico.
- Verificar branch atual.
- Criar ou alterar arquivos dentro do escopo.
- Criar commits locais, se a instrucao permitir.
- Preparar descricao de PR.
- Reportar diff e validacoes.

## O Que Exige Aprovacao Do Codex

Exige aprovacao previa:

- Criar branch sem instrucao.
- Fazer push.
- Abrir PR.
- Marcar PR como pronto para revisao.
- Fazer merge.
- Fazer force push.
- Apagar branch remota.
- Fechar issue.
- Criar release ou tag.
- Alterar configuracoes do repositorio.
- Alterar GitHub Actions, secrets, environments ou branch protection.
- Reverter commits compartilhados.

## Processo de Merge

Recomendacao inicial:

- Merge em `main` somente via PR.
- Exigir revisao do Codex.
- Exigir checks/testes quando existirem.
- Preferir squash merge para manter historico limpo.
- Mensagem do squash deve seguir convencao de commits.
- Remover branch remota apos merge aprovado.

Exemplo de titulo de merge:

```text
feat(clients): add initial client management
```

Enquanto nao houver CI, Codex deve registrar manualmente quais validacoes foram executadas antes de aprovar.
