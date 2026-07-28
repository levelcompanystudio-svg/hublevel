# Layouts canonicos

Referenciado por `../SKILL.md`. Estes layouts descrevem como combinar os componentes
existentes (`Card`, `Button`, `Badge`, `SectionHeader`, `Tabs`, `StatsGrid`,
`SummaryCard`, `FilterBar`, `PageHeader`, estados de feedback) sem criar padroes novos.

## Breakpoints e largura

O projeto usa Tailwind CSS 4. Usar os breakpoints padrao do Tailwind:

- mobile: abaixo de `md` (< 768px);
- notebook/tablet largo: `md` a `xl` (768px a 1279px);
- desktop: `xl` em diante (>= 1280px).

AppShell atual:

- sidebar desktop: `w-64`;
- conteudo: `md:pl-64`;
- main: `max-w-[1600px]`, `px-4 sm:px-6 lg:px-8 xl:px-10`, `py-6`;
- mobile: `MobileSidebar` como drawer, nunca sidebar fixa espremida.

## Regras globais de acoes

- Acao primaria: no maximo 1 por pagina ou por contexto local.
- Acoes secundarias: ate 2 visiveis se forem frequentes.
- Overflow/menu: qualquer acao menos frequente, tecnica ou administrativa.
- Acao destrutiva: nunca destaque principal; usar tom destrutivo apenas no controle final.
- Header com 5 botoes visiveis e proibido.

## AppShell

Estrutura:

- Sidebar fixa em desktop.
- Topbar compacta com contexto da rota e botao mobile.
- Main fluido dentro de `max-w-[1600px]`.
- Rodape da sidebar concentra usuario, notificacoes, tema e logout.

Mobile:

- Sidebar vira drawer.
- Topbar mostra botao de menu.
- Main usa `px-4`.
- Conteudo nao deve depender de hover para acao essencial.

Notebook:

- Sidebar `w-64`.
- Main usa `sm:px-6 lg:px-8`.
- Evitar colunas demais; preferir grids 2-3 colunas.

Desktop:

- Main pode usar `xl:px-10`.
- Usar largura ate `1600px`; nao limitar a 900-1100px em telas operacionais.

Evitar:

- Breadcrumbs globais dentro do shell.
- Duplicar logout/topbar e sidebar.
- Conteudo de pagina dentro da navegacao.

## Dashboard

Estrutura:

- Single-column de secoes empilhadas.
- Topo com ate 4 KPIs.
- Abaixo: pares de cards em `lg:grid-cols-2` quando fazem sentido.
- Performance deve ser resumo, nao pagina analitica completa.

Acoes:

- Sem acao primaria global obrigatoria.
- Links de secao como `Ver todos`, `Integracoes`, `Ver detalhes`.

Mobile:

- KPIs em 1 coluna.
- Graficos responsivos.
- Cards empilhados.

Notebook:

- KPIs em 2 ou 4 colunas conforme espaco.
- Cards principais em 2 colunas apenas se nao esmagar conteudo.

Desktop:

- Usar largura total.
- Evitar vazio central; graficos e cards devem ocupar area util.

Evitar:

- Mais de 4 KPIs no topo.
- Grafico sem dados.
- Metrica sem periodo ou fonte.

## ListPage

Estrutura:

- `PageHeader`: titulo, contagem, 1 acao primaria.
- Filtros imediatamente abaixo do header.
- Tabela/lista densa abaixo dos filtros.

Acoes:

- Primaria: criar/adicionar.
- Secundarias: exportar, limpar filtro, alternar view.
- Linha: editar/abrir/menu na direita.

Mobile:

- Filtros empilham.
- Tabela usa scroll horizontal.
- Acoes de linha podem virar menu.

Notebook:

- Filtros em grid compacto.
- Tabela ocupa largura total.

Desktop:

- Tabela larga, com colunas relevantes visiveis.
- Nao transformar lista comparavel em cards grandes.

Evitar:

- Filtro em card distante da tabela.
- Cards para itens simples.
- Linha alta demais.

## EntityDetailPage

Estrutura:

- Header compacto full-width.
- Badges e metadados em uma linha.
- Indicadores compactos: 3 a 6.
- `Tabs` horizontais.
- Conteudo da aba em single-column ou 2 colunas internas.

Acoes:

- Primaria: editar ou acao operacional dominante.
- Secundarias: nova tarefa, nova atualizacao, nova reuniao, novo documento.
- Se houver mais de 2 secundarias, usar overflow.

Mobile:

- Header quebra em blocos.
- Acoes secundarias viram menu/stack discreta.
- Tabs com scroll horizontal.
- Indicadores em 1-2 colunas.

Notebook:

- Header e tabs precisam caber sem overflow visual.
- Indicadores em 3 colunas ou 6 compactos.

Desktop:

- Usar largura para comparar contexto e proximas acoes.
- Nao criar hero grande dentro do detalhe.

Evitar:

- Seis cards gigantes no topo.
- Duplicar uma aba inteira na visao geral.
- Botoes primarios concorrentes.

## SettingsPage

Estrutura:

- Secoes empilhadas por assunto.
- Formularios podem ter largura maxima confortavel.
- Cada secao tem titulo curto e descricao minima.

Acoes:

- Primaria: salvar a secao/pagina.
- Secundarias: cancelar, redefinir, convidar.
- Destrutivas: inativar/excluir sempre discretas e confirmadas.

Mobile:

- Campos em 1 coluna.
- Botoes full-width apenas quando necessario.

Notebook:

- Inputs nao precisam esticar ate a largura total se ficarem ilegiveis.

Desktop:

- Pode usar coluna principal + lateral curta quando houver ajuda/config auxiliar.

Evitar:

- Um unico card monolitico para todas as configuracoes.
- Texto instrucional longo permanente.

## IntegrationPage

Estrutura:

- Lista/grid de provedores.
- Ordem de cada provider: provider -> conta -> status -> ultima sync -> erro -> acao.
- Estados: conectado, sincronizando, desconectado, erro.

Acoes:

- Desconectado: `Conectar`.
- Conectado: `Sincronizar`.
- Erro: `Reconectar` ou `Tentar novamente`.
- Nunca mostrar duas acoes primarias no mesmo provider.

Mobile:

- Cards em 1 coluna.
- Conta/status sempre visiveis antes da acao.

Notebook:

- Cards 1-2 colunas, conforme conteudo.

Desktop:

- Pode usar tabela se houver muitos clientes/provedores.

Evitar:

- Esconder erro atras de clique.
- Mostrar token, secret, payload tecnico ou stack trace.

## FormPage

Estrutura:

- Largura confortavel.
- 2 colunas para campos curtos relacionados.
- 1 coluna para campos longos.
- Labels acima do campo.

Acoes:

- Primaria: submit no fim do formulario.
- Secundaria: cancelar/voltar.
- Botao de submit bloqueia durante envio.

Mobile:

- Tudo em 1 coluna.
- Inputs com largura total.

Notebook:

- 2 colunas quando ajuda velocidade.

Desktop:

- Nao esticar textarea/input longo sem necessidade.

Evitar:

- Muitos cards para formulario simples.
- Ajuda permanente longa em cada campo.

## AdminTablePage

Estrutura:

- Header compacto.
- Filtros/busca no topo.
- Tabela densa ocupando o restante.
- Numeros alinhados a direita.

Acoes:

- Primaria: criar/exportar quando aplicavel.
- Linha: editar/status/menu.
- Destrutiva: confirmada e sem destaque principal.

Mobile:

- Scroll horizontal aceitavel.
- Priorizar leitura, nao tentar transformar tudo em card.

Notebook:

- Alta densidade.
- Colunas essenciais visiveis.

Desktop:

- Usar largura total e evitar coluna inutil.

Evitar:

- Cards "amigaveis" para dado administrativo comparavel.
- Descricoes longas no topo.

## AnalyticsPage / PerformancePage

Estrutura:

- Header com contexto e periodo.
- Filtro de periodo colado aos dados.
- Cards de resumo.
- Grafico principal.
- Tabela de apoio quando ha dado real.

Acoes:

- Primaria: nenhuma por padrao em leitura analitica.
- Secundarias: sincronizar, exportar, abrir integracoes.

Mobile:

- Cards em 1 coluna.
- Grafico full-width.
- Tabela com scroll horizontal.

Notebook:

- Cards 2-4 colunas.
- Grafico abaixo dos cards.

Desktop:

- Grafico deve usar area util; tabela fica abaixo.

Evitar:

- Grafico com zero fake.
- Filtro de periodo que nao altera query.
- Misturar dados financeiros admin-only com performance operacional sem permissao.
