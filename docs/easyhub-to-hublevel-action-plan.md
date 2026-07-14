# Plano de Acao: EasyHub Benchmark -> HubLevel

Data: 2026-07-13  
Responsavel por arquitetura/revisao: Codex  
Responsavel por execucao: Claude Code / Antigravity  
Base: `docs/easyhub-benchmark-analysis.md`

## 1. Objetivo

Transformar os aprendizados do EasyHub em uma arquitetura evolutiva para o HubLevel, sem copiar codigo, dados ou arquitetura do EasyHub.

O HubLevel deve evoluir para uma plataforma operacional interna onde o cliente e a unidade central da operacao.

Principio central:

> O Dashboard mostra a operacao agregada. O detalhe do Cliente concentra a execucao.

## 2. Regras Gerais Para Claude

Claude deve executar uma etapa por vez.

Antes de iniciar qualquer etapa:

- Ler `Claude.md`.
- Ler `docs/easyhub-benchmark-analysis.md`.
- Ler este plano.
- Conferir o estado atual do Git.
- Nao misturar etapas.
- Nao criar migrations sem instrucao explicita do Codex.
- Nao alterar Auth, Supabase client, RLS ou migrations sem autorizacao.
- Nao commitar nem fazer push sem aprovacao do Codex.

Depois de cada etapa, Claude deve reportar:

- Arquivos criados.
- Arquivos alterados.
- Queries criadas ou alteradas.
- Se houve alteracao em banco ou migrations.
- Validacoes executadas.
- Resultado de `npm run check`, `npm run lint`, `npm run build`.
- Riscos e pendencias.

Codex revisa cada etapa antes da proxima.

## 3. Arquitetura-Alvo do HubLevel

### 3.1 Navegacao Recomendada

#### Dashboard

- Dashboard
- Minha Agenda

#### Operacao

- Clientes
- Tarefas
- Acompanhamento
- Reunioes
- Agenda
- Documentos

#### Comercial/Admin

- Comercial
- Contratos
- Financeiro
- Servicos

#### Performance

- Relatorios
- Alertas
- Indicadores

#### Administracao

- Configuracoes
- Usuarios
- Integracoes

### 3.2 Centro Operacional: Cliente

O detalhe do cliente deve virar o hub operacional do sistema.

Abas-alvo:

- Visao geral
- Servicos contratados
- Contratos
- Financeiro
- Tarefas
- Atualizacoes
- Reunioes
- Documentos
- Comentarios
- Historico
- Alertas

No MVP/V1, nem todas precisam ter dados completos. A estrutura visual pode existir antes da integracao real, desde que nao crie queries falsas nem dados fake.

## 4. Roadmap Executivo

### Fase 0 - Organizacao e Baseline

Objetivo: organizar o projeto antes de novas features.

Status recomendado:

- Finalizar commit da analise benchmark, se aprovado.
- Garantir que `.claude/` nao entre em commit.
- Atualizar documentacao do estado atual do produto.

Entregaveis:

- `docs/easyhub-benchmark-analysis.md`
- Este plano de acao.
- Opcional: atualizar `PRD.md` futuramente, porque hoje ele esta generico e desatualizado.

### Fase 1 - Cliente Como Hub Operacional

Objetivo: consolidar Clientes como centro da operacao.

Status atual:

- Redesign visual de Clientes ja iniciado.
- Listagem por cards.
- Detalhe com hero, resumo e abas visuais.

Proximas etapas:

1. Conectar aba Tarefas no detalhe do cliente.
2. Conectar aba Financeiro no detalhe do cliente para Admin.
3. Conectar aba Servicos contratados.
4. Conectar aba Contratos.
5. Conectar aba Documentos.
6. Conectar aba Atualizacoes.
7. Conectar aba Reunioes.

Regras:

- Usar dados reais existentes.
- Nao duplicar queries sem necessidade.
- Respeitar RLS.
- Admin ve tudo.
- Gestor ve apenas clientes sob responsabilidade.
- Colaborador nao acessa Clientes.
- Financeiro e Contratos continuam Admin only, salvo nova decisao.

### Fase 2 - Contratos

Objetivo: implementar modulo Contratos e preparar vinculo com cliente.

Dependencias:

- Banco ja possui `contracts`.
- `documents` ja existe.
- `financial_records` ja possui `contract_id`.

Escopo V1:

- Listagem de contratos.
- Criacao de contrato.
- Edicao basica.
- Detalhe do contrato.
- Vinculo com cliente.
- Status e vigencia.
- Valor mensal.
- Dia de cobranca.
- Prazo de aviso.
- Documento vinculado opcional.

Permissoes:

- Admin: acesso total.
- Gestor: por enquanto sem acesso, conforme regra atual Admin only.
- Colaborador: sem acesso.

Critérios de aceite:

- Contratos aparecem no menu apenas para Admin.
- Nenhuma query financeira indevida para Gestor/Colaborador.
- Contrato pode ser visualizado a partir do cliente.
- `npm run check`, `lint`, `build` passam.

### Fase 3 - Servicos Contratados Por Cliente

Objetivo: conectar catalogo de servicos aos clientes.

Dependencias:

- `services` implementado.
- `client_services` existe no banco.

Escopo V1:

- Aba "Servicos contratados" no detalhe do cliente.
- Listar servicos contratados do cliente.
- Adicionar servico contratado.
- Editar status, valor mensal, inicio e fim.
- Mostrar resumo no detalhe do cliente.

Permissoes:

- Admin: gerencia.
- Gestor: visualiza para seus clientes; alteracao apenas se Codex aprovar.
- Colaborador: sem acesso via cliente.

Critérios de aceite:

- Nao alterar catalogo global sem permissao.
- Nao criar contrato automaticamente.
- Nao criar financeiro automaticamente nesta etapa.

### Fase 4 - Acompanhamento / Atualizacoes

Objetivo: trazer o conceito forte do EasyHub de acompanhamento semanal por cliente.

Dependencias:

- Banco ja possui `updates`.
- Cliente ja tem detalhe com abas.

Escopo V1:

- Rota `/app/acompanhamento`.
- Lista por cliente com:
  - Ultima atualizacao.
  - Quantidade de atualizacoes no periodo.
  - Status da ultima atualizacao.
  - Tarefas abertas vinculadas ao cliente.
- Aba "Atualizacoes" no detalhe do cliente.
- Criar atualizacao para cliente.
- Visualizar historico de atualizacoes.

Permissoes:

- Admin: ve todos.
- Gestor: ve e cria para seus clientes.
- Colaborador: inicialmente sem acesso, ou apenas leitura quando vinculado a tarefa, se RLS permitir.

Critérios de aceite:

- Dashboard consegue identificar clientes sem atualizacao.
- Nao buscar dados de performance paga.
- Sem dados fake.

### Fase 5 - Agenda CS / Reunioes

Objetivo: estruturar reunioes recorrentes e governanca de consultorias/alinhamentos.

Dependencias:

- Banco possui `meetings`.
- Banco possui `agenda_events`.

Escopo V1:

- Rota `/app/reunioes` ou `/app/agenda-cs`.
- Lista por cliente:
  - Frequencia.
  - Semana projetada.
  - Ultima reuniao.
  - Proxima reuniao.
  - Status.
  - Pos-reuniao.
- Criar reuniao.
- Editar status.
- Aba "Reunioes" no detalhe do cliente.

Status sugeridos:

- agendada
- realizada
- cancelada
- remarcada
- aguardando_retorno, se precisar de migration futura

Critérios de aceite:

- Dashboard consegue identificar clientes sem reuniao recente.
- Gestor trabalha apenas com seus clientes.
- Colaborador nao acessa informacoes sensiveis.

### Fase 6 - Dashboard Operacional Real

Objetivo: substituir placeholders por dados internos reais.

Dependencias:

- Clientes.
- Tarefas.
- Financeiro.
- Atualizacoes.
- Reunioes.

Escopo por papel:

Admin:

- Clientes ativos.
- Clientes em atraso.
- Clientes sem atualizacao.
- Clientes sem reuniao recente.
- Receita prevista.
- Receita recebida.
- Tarefas vencidas.
- Reunioes da semana.

Gestor:

- Meus clientes.
- Clientes sem atualizacao.
- Clientes sem reuniao recente.
- Tarefas vencidas.
- Reunioes da semana.

Colaborador:

- Minhas tarefas.
- Tarefas vencidas.
- Minhas reunioes.

Critérios de aceite:

- Cada card usa dados reais.
- Sem dados fake.
- Sem expor financeiro para Gestor/Colaborador.
- Queries segregadas por modulo ou agregadas com cuidado.

### Fase 7 - Documentos e Anexos

Objetivo: centralizar contratos, propostas, briefings, relatorios e comprovantes.

Dependencias:

- Banco possui `documents`.
- Banco possui `attachments`.

Escopo V1/V2:

- Aba "Documentos" no detalhe do cliente.
- Listagem de documentos por cliente.
- Cadastro de documento com URL externa ou arquivo.
- Tipo de documento.
- Vinculo com contrato quando aplicavel.

Permissoes:

- Admin: total.
- Gestor: documentos operacionais dos seus clientes, sem contrato/financeiro se Admin only.
- Colaborador: inicialmente sem acesso.

### Fase 8 - Configuracoes e Usuarios

Objetivo: tirar Configuracoes do placeholder.

Escopo V1:

- Minha conta.
- Nome do usuario.
- Role visivel.
- Status da conta.
- Preferencia visual.

Escopo V2:

- Admin gerencia usuarios.
- Convites.
- Promocao de papel.
- Inativacao.

Regras:

- Usuario edita apenas o proprio nome.
- Admin gerencia usuarios.
- Nao alterar Auth sem planejamento especifico.

### Fase 9 - Alertas

Objetivo: criar camada de inteligencia operacional.

Inicio recomendado:

- Primeiro alertas calculados no frontend/dashboard.
- Depois persistir em tabela propria, se necessario.

Alertas sugeridos:

- Cliente sem atualizacao.
- Cliente sem reuniao recente.
- Tarefa vencida.
- Financeiro atrasado.
- Contrato perto do fim.
- Cliente em saude critica.

### Fase 10 - Entregaveis e Checklist

Objetivo: maturidade operacional.

Entregaveis:

- Controle mensal por cliente.
- Status entregue/pendente/atrasado.
- Relacao com documentos e atualizacoes.

Checklist:

- Templates por servico.
- Checklists por cliente.
- Itens concluidos.
- Progresso visual.

Recomendacao:

- V2, depois de Atualizacoes e Reunioes.

### Fase 11 - Integracoes e Performance Paga

Objetivo: conectar Meta, Google, LinkedIn e performance real.

Recomendacao:

- V3.
- Nao iniciar antes da operacao interna estar consolidada.

Escopo futuro:

- Saude das integracoes.
- Tokens expirando.
- Clientes sem integracao.
- Performance por canal.
- Ranking por cliente.
- CPL, leads, investimento.

### Fase 12 - Planejador com IA e Onboarding Interno

Objetivo: evoluir para ferramenta estrategica.

Planejador:

- Gerar planejamento a partir de briefing.
- Usar documentos/briefings do cliente.
- Gerar tiers de plano.

Onboarding interno:

- Playbooks.
- Modulos de treinamento.
- Trilhas por papel.
- Desenvolvimento da equipe.

Recomendacao:

- V3.

## 5. Sequencia Recomendada de Execucao Para Claude

### Etapa A - Finalizar Base de Clientes

Objetivo:

Consolidar o detalhe de cliente como hub visual e preparar pontos de extensao para abas futuras.

Claude deve:

- Revisar componentes atuais de Clientes.
- Garantir que o detalhe suporta abas sem criar queries extras.
- Garantir que filtros/busca da listagem sao locais.
- Garantir que nao houve regressao em criar/editar/visualizar cliente.

Nao fazer:

- Nao conectar financeiro/tarefas/servicos ainda.
- Nao criar migrations.

### Etapa B - Contratos

Objetivo:

Criar modulo real de Contratos Admin only.

Claude deve implementar:

- `src/features/contracts/`
- `contracts.types.ts`
- `contracts.api.ts`
- Pages:
  - ContractListPage
  - ContractFormPage
  - ContractDetailsPage
- Components:
  - ContractTable
  - ContractForm
  - ContractStatusBadge
  - ContractHeader

Rotas:

- `/app/contratos`
- `/app/contratos/novo`
- `/app/contratos/:id`
- `/app/contratos/:id/editar`

### Etapa C - Servicos Contratados no Cliente

Objetivo:

Conectar `client_services` ao detalhe do cliente.

Claude deve implementar:

- API especifica para client services.
- Componente da aba Servicos.
- Criar/editar vinculo cliente-servico.

### Etapa D - Acompanhamento

Objetivo:

Implementar modulo de atualizacoes por cliente.

Claude deve implementar:

- Rota `/app/acompanhamento`.
- Feature `updates` ou `followups`.
- Listagem por cliente.
- Criacao de atualizacao.
- Historico no detalhe do cliente.

### Etapa E - Reunioes / Agenda CS

Objetivo:

Implementar governanca de reunioes por cliente.

Claude deve implementar:

- Rota `/app/reunioes` ou `/app/agenda-cs`.
- Feature `meetings`.
- Lista por cliente.
- Criacao/edicao de reuniao.
- Aba no detalhe do cliente.

### Etapa F - Dashboard Real

Objetivo:

Conectar dashboard aos dados internos.

Claude deve:

- Criar APIs agregadas ou hooks por modulo.
- Manter segregacao por role.
- Nao expor financeiro para nao-admin.

## 6. Criterios Globais de Aceite

Toda etapa deve cumprir:

- `npm run check` passa.
- `npm run lint` passa.
- `npm run build` passa.
- Nenhum secret em diff.
- Nenhuma migration sem autorizacao.
- Nenhuma query fora do escopo.
- Permissoes por role preservadas.
- RLS respeitada.
- Rotas existentes nao quebradas.
- Estados de loading, empty e error implementados.
- UX consistente com o design system atual.

## 7. Checklist de Revisao do Codex

Para cada entrega do Claude, Codex deve revisar:

- Arquivos alterados.
- Queries criadas.
- Se alterou Auth, rotas ou permissions.
- Se alterou banco/migrations.
- Se a etapa esta isolada.
- Se respeita Admin/Gestor/Colaborador.
- Se nao criou dados fake.
- Se nao copiou EasyHub.
- Se a UI mantem o padrao HubLevel.
- Resultado de check/lint/build.

## 8. Decisao Arquitetural Principal

O HubLevel deve evitar virar uma colecao de CRUDs isolados.

A arquitetura funcional deve convergir para:

- Dashboard como cockpit agregado.
- Cliente como hub operacional.
- Tarefas como execucao diaria.
- Acompanhamento como rotina semanal.
- Reunioes como governanca de relacionamento.
- Contratos/Financeiro como camada administrativa.
- Documentos/Comentarios/Historico como memoria operacional.

Essa direcao permite crescer sem refatoracoes estruturais grandes.
