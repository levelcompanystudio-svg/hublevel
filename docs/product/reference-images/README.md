# Reference Images — Audit

Este diretório contém as imagens de referência visual usadas para construir a skill
`.claude/skills/hublevel-design-system/SKILL.md`. Este documento é o registro do audit
de cada imagem: o que ela mostra, e o que dela serve (ou não) como referência para o
HubLevel. As regras derivadas deste audit vivem na skill, não aqui — este arquivo é a
evidência, não a regra.

**Não copiar identidade, texto, ícones de marca ou layout pixel-a-pixel destas imagens.**
O que se aproveita é o princípio estrutural (hierarquia, densidade, agrupamento), nunca a
aparência literal do produto de referência.

## Composição do conjunto atual

5 imagens no total: **2 do Attio** (CRM) e **3 do Linear** (gestão de issues/produto).
Não há, no momento deste audit, nenhuma imagem real do Stripe nem do Vercel — as regras
de "Financeiro" (Stripe) e "Integrações" (Vercel) na skill são baseadas na identidade de
design pública desses produtos, não em uma imagem auditada aqui. Se novas imagens forem
adicionadas, atualizar esta seção e a nota correspondente na skill.

---

## `attio-leads-table.jpg`

**Produto**: Attio (CRM).
**Tipo de tela**: listagem/coleção ("Leads") em formato de tabela dentro de um browser
mockup.

- **Hierarquia visual**: sidebar à esquerda com navegação por "Collections" (Network,
  Leads, Suppliers, Fundraising, Recruitment, Internal, Customer Success, Onboarding,
  Legal); topo com breadcrumb de workspace + usuário; barra de ações da lista (New
  Overview, Filtered by Status, Sorted by Time Added, Default view, Import/Export) logo
  acima da tabela.
- **Densidade**: alta — linhas finas, muitas colunas visíveis simultaneamente (Contacts,
  Stage, Multi-Select, Last Contacted, Domain).
- **Grid**: tabela de largura total, sidebar fixa estreita à esquerda.
- **Navegação**: sidebar por coleções, não por "páginas" genéricas — cada coleção é uma
  entidade de negócio (Leads, Suppliers, etc.).
- **Tipografia**: sem serifa, tamanhos pequenos e consistentes, pouco contraste de peso
  entre título de coluna e conteúdo.
- **Espaçamento**: compacto, pouco respiro vertical entre linhas — prioriza quantidade de
  dados visíveis sobre conforto de leitura.
- **Comportamento de filtros**: barra de filtros/ordenação acoplada diretamente acima da
  tabela que ela controla ("Filtered by Status", "Sorted by Time Added").
- **Tabelas**: célula de "Multi-Select" com dropdown aberto mostrando tags coloridas por
  categoria (Marketing, Software, E-Commerce, SaaS, FinTech) — um padrão de tag semântica
  reutilizável.
- **Cards**: nenhum — tudo é tabela.
- **Estados**: coluna "Stage" usa bolinha de cor + texto (Meeting Scheduled, Opportunity,
  Lost, Won) — status semântico compacto, sem badge grande.
- **Ações**: "Add Entry" no rodapé da tabela; ações de linha não aparecem em destaque
  (provavelmente hover/context menu).

**Serve para o HubLevel**: o padrão de tabela densa com status semântico em bolinha+texto
(usar em Clientes, Tarefas, Entregáveis); barra de filtro/ordenação colada à tabela;
dropdown de multi-select com tags coloridas por categoria.

**Não copiar**: a navegação por "Collections" genéricas (o HubLevel já tem navegação por
módulo definida); os nomes de produto/marca; o mockup de browser em si.

---

## `attio-record-detail.jpg`

**Produto**: Attio (CRM) — página de detalhe de um registro (empresa chamada "Stripe"
dentro do CRM do usuário; **isto não é uma screenshot do produto Stripe**).
**Tipo de tela**: detalhe de entidade (Entity Detail).

- **Hierarquia visual**: header compacto (nome + 2 badges de contexto: "Very strong with
  Eileen Charles", "Tom Bridge 2 hours ago") + avatares de time no canto superior direito
  + 2 ações primárias ("Add to List", "Compose Email") e 1 ícone de comentário.
- **Densidade**: média — tabs de conteúdo (Activity, Emails 12, Files 1, Notes 2, Team
  32, Tasks 3) com contagem inline em cada tab, o que já comunica volume sem abrir a aba.
- **Grid**: duas colunas — conteúdo principal (feed de atividade) à esquerda, painel
  lateral fixo de "Record details" à direita.
- **Navegação**: tabs horizontais logo abaixo do header, breadcrumb "Company / Stripe" no
  topo da página.
- **Tipografia**: título da entidade em destaque (peso maior), resto do conteúdo em peso
  regular/pequeno.
- **Espaçamento**: respiro generoso entre itens do feed de atividade (cada evento é uma
  linha/bloco separado por espaço, não por borda pesada).
- **Comportamento de filtros**: botão "Filters" no canto superior direito da área de
  atividade — filtro por tipo de evento, não por período (visualmente só o botão está
  presente, sem estado aberto na imagem).
- **Tabelas**: nenhuma nesta tela — é feed + painel lateral.
- **Cards**: eventos "upcoming" (reunião agendada) aparecem como bloco levemente
  destacado dentro do feed (avatares dos convidados + horário) — um card *dentro* do
  feed, não ao lado dele; é o único lugar onde a tela usa um card de verdade.
- **Estados**: badge "Scheduled" no evento futuro; agrupamento por data ("Upcoming",
  "This week", ano "2023") organiza o feed cronologicamente.
- **Ações**: ações de registro concentradas no header (2 botões + 1 ícone), não repetidas
  em cada linha do feed.
- **Painel lateral**: "Record details" com campos objetivos (domínios, descrição curta,
  tags de categoria, localização) e "Show more" para não estourar a tela; seção "Lists"
  colapsada por padrão.

**Serve para o HubLevel**: o modelo de entity header compacto com poucas ações
primárias; tabs com contagem inline; painel lateral de detalhes objetivo com "Show
more" em vez de mostrar tudo sempre; feed de atividade agrupado por data.

**Não copiar**: o nome "Stripe" como exemplo (é só o nome de um registro de exemplo no
CRM do Attio, não relacionado ao produto Stripe); os textos/avatares de exemplo; o ícone
de marca do Attio.

---

## `linear-active-issues-list.jpg`

**Produto**: Linear (gestão de issues).
**Tipo de tela**: listagem operacional agrupada por status ("Active issues").

- **Hierarquia visual**: sidebar esquerda enxuta (Search, Inbox, My Issues, Favorites,
  times); header da lista com título + contagem total ("Active issues 15") + filtro +
  ação de criar (+); grupos por status com contagem própria ("In Review 2", "In Progress
  5", "Todo 8").
- **Densidade**: muito alta — linhas de ~28px, sem padding excessivo, várias colunas de
  metadado por linha (ID, ícone de status, título, PR link, label colorida, projeto,
  estimativa, data, avatar).
- **Grid**: janela única (mockup de app desktop), sidebar fixa + conteúdo fluido.
- **Navegação**: sidebar por seções fixas (Search, Inbox, My Issues) + favoritos +
  árvore de times/projetos — hierarquia clara entre "meu trabalho" e "trabalho do time".
- **Tipografia**: tamanho único pequeno para conteúdo de linha, sem variação de peso
  chamativa — o que hierarquiza é o agrupamento, não a tipografia.
- **Espaçamento**: mínimo entre linhas do mesmo grupo; espaço maior entre grupos
  (In Review / In Progress / Todo) para eles se lerem como seções distintas.
- **Comportamento de filtros**: botão "+ Filter" ao lado do título, mesma linha da
  contagem — filtro é parte do cabeçalho, não uma seção separada.
- **Tabelas**: não é uma tabela tradicional (sem cabeçalho de coluna visível), mas
  funciona como uma pela repetição de posição dos metadados por linha.
- **Cards**: nenhum.
- **Estados**: ícone de status por linha (círculo com progresso parcial para
  "In Progress", check para "In Review", círculo vazio para "Todo") — status visual sem
  precisar de texto.
- **Ações**: "+" para criar item, por grupo e no header geral; ações de linha (assignee,
  reação) ficam no fim da linha, alinhadas à direita.

**Serve para o HubLevel**: agrupamento por status com contagem no título do grupo (usar
em Tarefas, Entregáveis); botão de filtro colado ao título da lista; ícone de status
substituindo texto/badge quando o espaço é apertado; alta densidade como padrão para
listas operacionais internas (não voltadas ao cliente).

**Não copiar**: o chrome de macOS/wallpaper (é só ambientação do mockup, não faz parte do
produto); os nomes de projeto/time fictícios; a estimativa numérica de esforço (o
HubLevel não usa story points).

---

## `linear-cycle-details.jpg`

**Produto**: Linear.
**Tipo de tela**: painel de detalhe lateral ("Cycle Details") sobre uma lista.

- **Hierarquia visual**: painel de detalhe ocupa ~45% da largura à direita, lista de
  issues à esquerda; dentro do painel, um número grande (53% success) é o elemento de
  maior peso visual da tela inteira.
- **Densidade**: lista à esquerda é densa (linha por issue com label + data + avatar);
  painel à direita é mais espaçoso, focado em 1 gráfico e 3 números-chave.
- **Grid**: duas colunas assimétricas (lista estreita a esquerda, painel de análise mais
  largo à direita) — o oposto do padrão "conteúdo largo + painel lateral estreito" visto
  no Attio, usado aqui porque o painel É o conteúdo principal desta tela.
- **Navegação**: toggle de visualização (lista/grid) + "View" (configuração de exibição)
  + botão de expandir/colapsar painel, todos agrupados no canto superior direito.
- **Tipografia**: número "53%" em tamanho muito maior que qualquer outro texto da tela —
  um único destaque numérico dominante, não vários números do mesmo tamanho competindo.
- **Espaçamento**: generoso dentro do painel de detalhe (o gráfico "respira"), compacto
  na lista de issues à esquerda.
- **Comportamento de filtros**: não há filtro visível nesta tela — é uma visão de detalhe
  fixa de um recorte (o ciclo atual).
- **Tabelas**: não — a lista à esquerda é lista simples, sem cabeçalho de coluna.
- **Cards**: nenhum — o painel de detalhe é uma seção só, sem sub-divisão em cards
  internos.
- **Estados**: labels coloridas por tipo de issue (Feature = roxo, Improvement = azul,
  Bug = vermelho) — mesma cor sempre para o mesmo tipo, em toda a lista.
- **Gráfico**: área com 2 séries (Effort sólida, Scope tracejada) + hachurado indicando
  projeção futura vs. real — comunica "real até aqui, estimado daqui pra frente" com
  textura, não só cor.

**Serve para o HubLevel**: 1 número grande como destaque central de um painel de detalhe
(ex.: uma aba "Resumo" de performance com 1 métrica-âncora); labels coloridas
consistentes por tipo/categoria; uso de traço tracejado/hachurado para distinguir
real vs. projetado num gráfico, sem precisar de legenda extra.

**Não copiar**: o conceito de "cycle" do Linear (é uma metodologia de sprint específica
do produto, não existe equivalente direto no HubLevel); a métrica "effort" em pontos.

---

## `linear-insights-chart.jpg`

**Produto**: Linear.
**Tipo de tela**: analytics/BI interno ("All issues › Insights").

- **Hierarquia visual**: breadcrumb "All issues > Insights" + botão "+ Filter" no topo;
  gráfico de barras empilhadas ocupando a maior parte da largura; painel de controle à
  direita (Measure, Dimension, Segment) + 2 toggles; tabela de dados abaixo do gráfico.
- **Densidade**: gráfico com ~25 barras (uma por assignee) é denso mas legível porque só
  usa 3–4 cores semânticas (Done, In Progress, Backlog, etc.) repetidas em todas as
  barras.
- **Grid**: gráfico + tabela ocupam a coluna principal (larga), painel de configuração
  fica em uma coluna estreita fixa à direita — mesmo padrão de "conteúdo largo + painel
  estreito" do Attio, agora aplicado a uma tela analítica.
- **Navegação**: breadcrumb indicando que "Insights" é uma sub-visão de "All issues", não
  uma página isolada.
- **Tipografia**: números do eixo Y e da tabela em fonte tabular (alinhamento numérico
  perfeito), texto de rótulo (nomes de assignee) menor e mais claro que os números.
- **Espaçamento**: painel de configuração à direita usa bastante espaço vertical entre
  cada controle (Measure / Dimension / Segment) — cada decisão de configuração é isolada
  visualmente da próxima.
- **Comportamento de filtros**: "+ Filter" no breadcrumb (filtra o dataset inteiro,
  gráfico + tabela); painel lateral com dropdowns "Measure/Dimension/Segment" que
  reconfiguram a visualização (não filtram, remodelam).
- **Tabelas**: tabela de apoio abaixo do gráfico repete os mesmos dados em formato
  numérico exato, coluna por status (Icebox, Backlog, Todo, In Progress, In Review,
  Done) — o gráfico dá a visão geral, a tabela dá o número exato.
- **Cards**: nenhum.
- **Estados**: 2 toggles simples ("Show archived issues", "Hide Unassigned") — filtros
  binários claramente rotulados, sem ambiguidade sobre o que fazem.
- **Ações**: nenhuma ação de escrita nesta tela — é somente leitura/análise.

**Serve para o HubLevel**: combinação gráfico (visão geral) + tabela (número exato) na
mesma tela, como já foi implementado em `/app/performance` (gráfico de tendência +
tabela "Detalhamento por dia"); números em fonte tabular alinhados; painel de
configuração separado do conteúdo, com uma decisão por linha.

**Não copiar**: os nomes "Measure/Dimension/Segment" como conceito genérico de BI (o
HubLevel deve nomear filtros pelo que eles realmente fazem no domínio, ex. "Período",
não abstrações genéricas de ferramenta de analytics).

---

## Elementos recorrentes nas 5 imagens (o que forma o padrão comum)

- Painel lateral estreito e fixo para navegação OU para detalhe, nunca os dois ao mesmo
  tempo competindo (Attio usa lateral pra nav OU pra detalhe dependendo da tela; Linear
  usa lateral pra nav OU pra configuração).
- Filtro sempre colado ao conteúdo que ele controla, nunca isolado em outra área da tela.
- Cor usada com função (status, categoria), nunca como decoração pura.
- Card é exceção, não regra — a maioria das telas das 5 imagens usa lista/tabela como
  container principal; card aparece só quando o conteúdo individual precisa de destaque
  (o evento agendado no Attio, por exemplo).
- Um número/dado tem sempre mais peso visual que os outros na tela (o "53%" do Linear, o
  "15" de active issues) — nenhuma das telas trata todos os números como iguais.
