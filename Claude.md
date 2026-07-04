# Claude.md

## Visao Geral

Este arquivo orienta assistentes de IA e colaboradores que forem trabalhar neste projeto. Use-o como fonte rapida de contexto antes de alterar codigo, documentacao ou estrutura do produto.

## Estado Atual do Projeto

- Nome do projeto: PROJETO 1
- Produto: a definir
- Stack tecnica: a definir
- Status: documentacao inicial criada antes da implementacao

Atualize esta secao assim que o projeto tiver codigo, dependencias, scripts, arquitetura ou decisoes tecnicas relevantes.

## Fluxo Oficial de Trabalho

Este projeto usa uma divisao clara de responsabilidades entre Codex e Claude.

### Responsabilidades do Codex

Codex e responsavel por:

- Arquitetura
- Planejamento
- Roadmap
- Criacao de issues
- Revisao de codigo
- Testes
- Aprovacao final

### Responsabilidades do Claude

Claude e responsavel por:

- Implementacao
- Refatoracao
- Criacao de componentes
- Criacao de paginas
- Ajustes de banco
- Correcoes

## Regra Obrigatoria Antes de Implementar

Antes de qualquer implementacao, o Codex deve gerar uma instrucao clara para o Claude executar.

Essa instrucao deve conter:

- Objetivo da tarefa
- Escopo esperado
- Arquivos ou areas provaveis de alteracao
- Regras tecnicas e de produto que devem ser respeitadas
- Criterios de aceite
- Comandos de teste ou validacao esperados, quando existirem

Claude deve executar apenas o que estiver definido na instrucao do Codex. Se a tarefa exigir mudancas fora do escopo, Claude deve registrar a necessidade e aguardar nova orientacao.

## Fluxo Apos Execucao do Claude

Depois que Claude concluir uma tarefa, o Codex deve:

1. Revisar as alteracoes realizadas.
2. Validar se a arquitetura continua coerente com o projeto.
3. Verificar possiveis problemas, regressoes, riscos e lacunas de teste.
4. Aprovar a entrega ou solicitar ajustes claros para Claude.

Nenhuma implementacao deve ser considerada finalizada sem a revisao e aprovacao final do Codex.

## Fluxo Oficial de MCP Supabase

O ambiente Supabase `dev` ja existe. O MCP Supabase deve ser usado apenas como ferramenta de desenvolvimento, revisao e auditoria interna. Nao implemente conexao real sem instrucao explicita.

### Regras Gerais

- Nunca usar producao como ambiente padrao.
- Sempre usar `project_ref` para limitar o MCP a um projeto especifico.
- Nunca commitar tokens, secrets, chaves privadas ou credenciais em arquivos do repositorio.
- Usar placeholders em documentacao, exemplos e arquivos versionados.
- Guardar valores reais somente em `.env.local` ou variaveis de ambiente seguras.
- Manter aprovacao manual de chamadas MCP ativa quando o cliente permitir.
- Preferir ambiente `dev`, branch de desenvolvimento ou projeto Supabase separado para qualquer operacao com escrita.

### Uso pelo Codex

Codex usa MCP Supabase em modo read-only para revisao, auditoria e validacao.

Codex pode usar MCP para:

- Revisar schema.
- Consultar migrations.
- Rodar queries somente leitura.
- Verificar logs.
- Consultar advisors de seguranca e performance.
- Validar se as alteracoes de Claude seguem a arquitetura definida.

Codex nao deve aplicar migrations, alterar dados, criar recursos ou executar operacoes destrutivas via MCP.

### Uso pelo Claude

Claude usa MCP Supabase para execucao somente em ambiente `dev`.

Claude pode usar MCP para:

- Consultar schema e tabelas.
- Consultar documentacao Supabase.
- Gerar tipos.
- Validar queries.
- Aplicar migrations apenas quando houver instrucao explicita do Codex.

Claude nao pode aplicar migrations, alterar schema, alterar dados ou fazer deploy de Edge Functions sem instrucao explicita do Codex.

Depois de qualquer alteracao no banco, Claude deve informar:

- Migrations criadas ou aplicadas.
- Queries executadas.
- Arquivos alterados.
- Validacoes realizadas.
- Riscos, limitacoes ou pontos pendentes.

### Revisao do Codex Apos Alteracoes no Banco

Depois que Claude fizer alteracoes relacionadas ao Supabase, Codex deve revisar usando:

- `git diff`
- Migrations criadas ou alteradas.
- Schema atual via MCP read-only.
- Logs do Supabase.
- Advisors de seguranca e performance.
- Arquivos de tipos gerados.
- Impacto arquitetural e aderencia ao PRD.

Consulte `docs/supabase-mcp.md` para o plano operacional completo e `docs/environment.md` para a estrutura de variaveis locais.

## Fluxo Oficial de MCP Para Claude

Claude pode usar MCPs somente como apoio a execucao das instrucoes geradas pelo Codex.

MCPs previstos para Claude:

- Supabase: execucao controlada no ambiente `dev`.
- Git/GitHub: leitura de contexto, issues, historico e apoio a resumo de alteracoes.
- Filesystem/projeto local: leitura e alteracao de arquivos dentro do escopo aprovado.
- Browser/Playwright, Docs, Package Registry ou Design: apenas quando a tarefa justificar e Codex aprovar.

Regras obrigatorias:

- Nao implementar conexoes MCP reais sem instrucao explicita.
- Nao usar credenciais reais em arquivos versionados.
- Usar apenas placeholders em `.mcp.json`, documentacao e exemplos.
- Claude executa somente o escopo definido pelo Codex.
- Operacoes de escrita sensiveis exigem aprovacao previa do Codex.
- Ao finalizar, Claude deve reportar arquivos alterados, MCPs usados, queries, migrations, testes e validacoes.

Consulte `docs/claude-mcp.md` para o plano tecnico completo do uso de MCPs pelo Claude.

## Fluxo Oficial de MCP Git/GitHub

O MCP Git/GitHub deve apoiar rastreabilidade, issues, branches, commits, pull requests e auditoria. Nao implemente conexao MCP real sem instrucao explicita.

Regras obrigatorias:

- Claude nao deve trabalhar direto em `main`.
- Claude so pode criar branch, commit, push ou PR quando isso estiver autorizado na instrucao do Codex.
- Claude nunca pode fazer merge, force push, release, tag ou alterar configuracoes do repositorio sem aprovacao explicita do Codex.
- Nenhum token, secret ou credencial deve ser registrado em `.mcp.json`, documentacao, commits ou exemplos.
- Branches devem seguir o padrao `feature/`, `fix/`, `docs/`, `chore/`, `refactor/` com identificador de issue ou tarefa.
- Commits devem ser pequenos, revisaveis e seguir convencao `tipo(escopo): descricao curta`.
- PRs devem conter objetivo, alteracoes, validacoes, MCPs usados, riscos e checklist.
- Merge em `main` so deve ocorrer apos revisao e aprovacao final do Codex.

Consulte `docs/git-mcp.md` para o plano tecnico completo de Git/GitHub MCP, branches, commits, PRs, revisao, auditoria e merge.

## Como Trabalhar Neste Repositorio

1. Leia primeiro `PRD.md` para entender objetivo, usuarios, escopo e prioridades do produto.
2. Antes de alterar arquivos, inspecione a estrutura atual do projeto e siga os padroes existentes.
3. Mantenha mudancas pequenas, explicitas e focadas no pedido.
4. Nao remova arquivos, configuracoes ou alteracoes existentes sem confirmar que fazem parte da tarefa.
5. Ao adicionar funcionalidades, inclua ou atualize testes quando houver estrutura de testes disponivel.
6. Atualize esta documentacao quando novas convencoes, comandos ou decisoes forem introduzidas.

## Comandos do Projeto

Preencha conforme a stack for definida.

```powershell
# instalar dependencias
# exemplo: npm install

# rodar em desenvolvimento
# exemplo: npm run dev

# executar testes
# exemplo: npm test

# build de producao
# exemplo: npm run build
```

## Estrutura Esperada

Ainda nao ha uma estrutura tecnica definida. Quando houver codigo, documente aqui os principais diretorios, por exemplo:

```text
src/        Codigo-fonte da aplicacao
tests/      Testes automatizados
docs/       Documentacao complementar
public/     Arquivos estaticos
```

## Padroes de Implementacao

- Prefira solucoes simples e consistentes com o restante do projeto.
- Evite criar abstracoes antes de existir repeticao ou complexidade real.
- Use nomes claros para arquivos, funcoes, componentes e variaveis.
- Separe regras de negocio de detalhes de interface ou infraestrutura quando isso ajudar a manutencao.
- Documente decisoes importantes quando elas afetarem arquitetura, dados, seguranca ou experiencia do usuario.

## Qualidade

Antes de considerar uma tarefa concluida:

- Verifique se o comportamento pedido foi implementado.
- Rode os testes ou validacoes disponiveis.
- Confira se a documentacao afetada continua correta.
- Garanta que nao foram feitas mudancas fora do escopo.

## Notas Para Assistentes

- Se faltarem informacoes de produto, consulte `PRD.md` e preencha lacunas com suposicoes explicitas.
- Se houver conflito entre documentacao e codigo existente, trate o codigo como fonte de verdade e proponha atualizar a documentacao.
- Se uma decisao for arriscada ou dificil de desfazer, pergunte antes de executar.
