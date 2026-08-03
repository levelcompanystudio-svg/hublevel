# PRD.md

# Documento de Requisitos do Produto

## 1. Resumo

O produto ainda esta em definicao. Este PRD serve como base inicial para registrar problema, publico-alvo, escopo, requisitos e criterios de sucesso do PROJETO 1.

## 2. Objetivo do Produto

Definir e construir uma solucao que resolva um problema claro para um publico especifico, com uma primeira versao simples, utilizavel e facil de evoluir.

## 3. Problema

Preencher:

- Qual problema o produto resolve?
- Quem sente esse problema?
- Como esse problema e resolvido hoje?
- Por que a solucao atual e insuficiente?

## 4. Publico-Alvo

Preencher:

- Usuario principal:
- Usuario secundario:
- Administrador ou operador, se houver:
- Contexto de uso:

## 5. Proposta de Valor

Preencher em uma frase:

> O PROJETO 1 ajuda [publico-alvo] a [resultado desejado] por meio de [diferencial principal].

## 6. Escopo Atual da Interface (pos-consolidacao)

O HubLevel evoluiu de template generico para uma plataforma interna de gestao de clientes/agencia. Esta secao documenta o escopo real da interface apos a consolidacao registrada em `docs/easyhub-to-hublevel-action-plan.md` e nas Etapas 1-5 de remocao de modulos duplicados/fora de foco.

### Nucleo operacional (incluido)

- Dashboard (cockpit operacional agregado)
- Clientes (hub operacional por cliente)
- Tarefas
- Acompanhamento
- Reunioes
- Entregaveis

### Administracao (incluido)

- Painel administrativo
- Contratos
- Financeiro
- Documentos
- Usuarios
- Configuracoes

### Performance e integracoes (incluido)

- Integracoes Meta Ads
- Integracoes Google Ads
- Performance por cliente
- Metricas reais de anuncios
- Backend `/server` (preservado, sem alteracoes)

### CRM V1 (incluido)

CRM leve, escopado por cliente, adicionado apos a consolidacao (migrations 031-033):

- Pipeline, etapas, contatos e oportunidades por cliente, dentro da aba "CRM" no detalhe do cliente (visivel apenas para Admin e Gestor).
- Visualizacao em Kanban simples (mudanca de etapa via select, sem drag-and-drop) e totais por etapa.
- Isolamento de acesso via `profile_type` (`internal`/`external`) em `profiles` e a tabela `client_user_memberships`, que vincula usuarios externos aos clientes que podem ver.
- Portal externo minimo em `/cliente`: usuarios `profile_type='external'` sao redirecionados para essa rota (nunca acessam `/app/*`) e veem, somente leitura, o nome real do cliente vinculado, pipeline, etapas, oportunidades e contatos — sem nenhum botao de criar, editar, mover etapa ou trocar status.
- O portal externo nao exibe financeiro, contratos, tarefas, reunioes, documentos, integracoes ou performance — apenas os dados de CRM do(s) cliente(s) vinculados via `client_user_memberships`.
- Integracoes Meta/Google Ads, Performance e o backend `/server` nao foram alterados pelo CRM V1.

### Removido da interface

Estes modulos foram implementados e depois removidos da interface por decisao de produto (duplicacao operacional com Tarefas, no caso de Checklist; fora do foco atual, nos demais casos):

- Landing Pages (`/lp/:id` publico e geracao de conteudo com IA)
- Planejador (briefing de landing page por cliente)
- Checklist (duplicava a funcao operacional de Tarefas)
- Servicos (catalogo de servicos e servicos contratados por cliente)

As tabelas `services` e `client_services` **permanecem no banco por compatibilidade historica** — nenhuma tabela ou migration foi apagada; apenas o codigo de interface que as consumia foi removido. O mesmo se aplica as tabelas historicas de Landing Pages.

### Fora do Escopo Atual

- Reintroducao de Landing Pages, Planejador, Checklist ou Servicos na interface, sem nova decisao de produto explicita.
- Automacoes complexas antes da validacao do uso real do nucleo operacional.
- Personalizacoes visuais extensas fora do sistema de design ja definido (`.claude/skills/hublevel-design-system/`).

## 7. Funcionalidades

### F1. Fluxo Principal

Como usuario, quero executar a acao principal do produto de forma simples, para obter o resultado esperado sem depender de suporte manual.

Critérios de aceite:

- O usuario consegue iniciar e concluir o fluxo principal.
- O sistema informa sucesso, erro ou pendencia de forma clara.
- Dados obrigatorios sao validados antes da conclusao.

### F2. Gestao de Dados Essenciais

Como usuario ou operador, quero criar, visualizar, editar e remover os dados centrais do produto, para manter as informacoes atualizadas.

Critérios de aceite:

- O sistema permite listar registros existentes.
- O sistema permite cadastrar novos registros.
- O sistema permite editar registros existentes.
- O sistema protege contra exclusoes acidentais quando isso for relevante.

### F3. Configuracao Basica

Como responsavel pelo produto, quero configurar parametros essenciais, para adaptar o sistema ao uso real.

Critérios de aceite:

- Configuracoes obrigatorias sao documentadas.
- Valores padrao sao seguros e previsiveis.
- Erros de configuracao sao faceis de diagnosticar.

## 8. Requisitos Nao Funcionais

- Usabilidade: a interface deve ser clara, objetiva e adequada ao publico-alvo.
- Performance: as telas e acoes principais devem responder rapidamente em uso normal.
- Confiabilidade: erros devem ser tratados sem perda inesperada de dados.
- Manutenibilidade: codigo e documentacao devem favorecer evolucao incremental.
- Seguranca: dados sensiveis nao devem ser expostos em logs, repositorio ou mensagens de erro.

## 9. Metricas de Sucesso

Preencher conforme o produto for definido:

- Taxa de conclusao do fluxo principal:
- Tempo medio para concluir o fluxo principal:
- Numero de usuarios ativos:
- Retencao:
- Reducao de trabalho manual:
- Satisfacao do usuario:

## 10. Riscos e Duvidas

- O problema e o publico-alvo ainda precisam ser definidos.
- A stack tecnica ainda nao foi escolhida.
- O modelo de dados ainda nao foi definido.
- Nao ha criterios finais de sucesso do negocio.

## 11. Roadmap Inicial

1. Definir problema, publico-alvo e proposta de valor.
2. Mapear o fluxo principal do usuario.
3. Escolher stack tecnica e estrutura do projeto.
4. Implementar primeira versao funcional.
5. Validar com usuarios reais ou cenarios representativos.
6. Ajustar produto com base no feedback.

## 12. Historico de Decisoes

Registre aqui decisoes relevantes do produto:

| Data | Decisao | Motivo |
| --- | --- | --- |
| 2026-07-03 | Criada documentacao inicial do projeto | Estabelecer base para produto e colaboracao com assistentes |
| 2026-07-29 | Removidas Landing Pages/Planejador, Checklist e Servicos da interface (banco preservado) | Consolidacao de escopo: eliminar duplicacao operacional (Checklist vs. Tarefas) e modulos fora do foco atual do nucleo operacional |
