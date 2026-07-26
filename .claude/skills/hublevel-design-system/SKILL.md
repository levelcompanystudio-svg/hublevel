---
name: hublevel-design-system
description: Sistema oficial e permanente de referencia visual do HubLevel. Consultar antes de criar, alterar ou revisar qualquer tela, pagina ou componente de interface (Dashboard, Clientes, Tarefas, Acompanhamento, Reunioes, Entregaveis, Integracoes, Financeiro, Formularios, Settings). Define tokens reais do projeto, tipografia, radius, espacamento, light/dark mode, navegacao, estados, feedback, layouts canonicos e checklist objetivo de aprovacao.
---

# HubLevel - Product & Design System

Esta e a skill oficial e unica de design do HubLevel. Qualquer regra visual nova deve ser
adicionada aqui ou em `references/`, nunca em documento paralelo.

Fonte de verdade tecnica:

- Tokens e classes globais: `src/styles/globals.css`.
- Primitivos UI: `src/components/ui/`.
- Estados de feedback: `src/components/feedback/`.
- Shell autenticado: `src/features/app/layout/`.
- Auditoria visual: `docs/product/reference-images/README.md`.
- Layouts canonicos: `references/canonical-layouts.md`.
- Checklist de aprovacao: `references/approval-checklist.md`.

## Uso obrigatorio

Antes de criar, alterar ou revisar interface:

1. Ler esta skill.
2. Ler `references/canonical-layouts.md` para o tipo de tela em questao.
3. Rodar mentalmente `references/approval-checklist.md` antes de aprovar a entrega.
4. Usar tokens e componentes existentes antes de criar variacoes.

Nao alterar tokens, CSS global ou componentes base sem uma instrucao explicita de design system.

## Personalidade do produto

O HubLevel deve parecer:

- operacional;
- confiavel;
- preciso;
- calmo;
- maduro;
- orientado a decisoes;
- profissional sem parecer corporativo pesado.

O HubLevel nao deve parecer:

- template generico;
- painel de admin sem criterio;
- dashboard gamer;
- interface neon;
- produto excessivamente decorativo;
- prototipo de vibe code.

Tom dos textos:

- direto, curto e informativo;
- sem exagero comercial;
- sem mensagem tecnica para usuario final quando uma explicacao simples resolve;
- erro tecnico detalhado fica em log, nao no texto principal da UI;
- empty state deve dizer a situacao real e a proxima acao quando houver.

## Fundamentos objetivos

### Tipografia

Fonte principal: `var(--font-sans)` = Plus Jakarta Sans, Inter, system-ui, sans-serif.
Fonte monoespacada: `var(--font-mono)` = JetBrains Mono, monospace.
Letter spacing global: `var(--letter-spacing) = 0`.

Classes oficiais em `globals.css`:

| Uso | Classe/tamanho | Peso | Line-height | Regra |
|---|---:|---:|---:|---|
| Page title | `text-h1` / 1.75rem | 600 | 1.25 | Titulo principal da pagina. Usar 1 por pagina. |
| Section title | `text-h2` / 1.25rem | 600 | 1.3 | Secoes principais quando precisam de hierarquia propria. |
| Card title | `text-h3` / 0.9375rem | 600 | 1.4 | Titulos de card, popover e blocos compactos. |
| Body | `text-sm` | 400/500 | 1.5-1.6 | Texto padrao de UI e conteudo. |
| Label | `text-xs font-semibold uppercase` | 600 | 1.4 | Rotulos de campo, coluna e metadado. |
| Helper text | `text-xs text-muted-foreground` | 400/500 | 1.4-1.6 | Ajuda, subtitulo curto e legenda. |
| Table text | `text-sm` | 400/500 | compacto | Linha de tabela. Cabecalho usa `text-xs uppercase`. |
| KPI value | `text-lg` a `text-2xl` | 600/700 | 1.1-1.25 | Numeros importantes; usar fonte tabular quando alinhar valores. |

Regras:

- Nao usar `text-4xl`, `text-5xl` ou hero type dentro do app autenticado.
- Evitar `font-bold` em excesso; reservar para valor KPI, logo e acao muito importante.
- Texto secundario usa `text-muted-foreground`, nunca cinza hardcoded.
- Numeros comparaveis devem ter alinhamento consistente e, quando possivel, `tabular-nums`.

### Radius

Tokens reais vindos de `@theme inline`:

| Token | Valor efetivo | Uso permitido |
|---|---:|---|
| `--radius-sm` | `calc(var(--radius) - 0.625rem)` = 0.375rem | inputs pequenos, celulas, controles densos |
| `--radius-md` | 0.5rem | buttons, selects, icon buttons, sidebar controls |
| `--radius-lg` | 0.75rem | sidebar item, empty icon, pequenos paineis |
| `--radius-xl` | 1rem | Card, EmptyState, popover |
| `--radius-2xl` | 1.5rem | modal/drawer grande, raramente |

Limites:

- Card padrao usa `rounded-xl`.
- Button usa `rounded-md`.
- Badge pode usar `rounded-full` por ser pill semantica pequena.
- Evitar `rounded-2xl` em cards comuns.
- Nao transformar todo elemento em pill; radius alto demais deixa o produto infantil.

### Espacamento

Unidade base real: `--spacing: 0.25rem` (4px). Usar multiplos verificaveis:

| Token Tailwind | px | Uso |
|---|---:|---|
| `1` | 4 | micro gap, borda interna minima |
| `1.5` | 6 | gap de badge/icon |
| `2` | 8 | gap compacto, linha de tabela |
| `2.5` | 10 | sidebar item, popover row |
| `3` | 12 | grupo pequeno, padding compacto |
| `4` | 16 | padding padrao de Card |
| `5` | 20 | distancia entre secoes compactas |
| `6` | 24 | bloco/form confortavel |
| `8` | 32 | separacao grande de pagina |
| `10` | 40 | margem lateral larga em desktop |

Regras objetivas:

- Card padrao: `p-4`.
- Card denso: `p-3`.
- Formulario confortavel: `p-5` ou `p-6`.
- Gap interno de card: `space-y-3` ou `space-y-4`.
- Entre secoes de pagina: `space-y-5` ou `space-y-6`.
- Titulo/subtitulo: `mt-1` ou `mt-1.5`.
- Tabela: `py-2` a `py-3`, `px-3` a `px-4`.
- AppShell: conteudo `px-4 sm:px-6 lg:px-8 xl:px-10`, `py-5`.
- Notebook: evitar largura estreita artificial; conteudo deve usar a area disponivel.
- Desktop amplo: `max-w-[1600px]` no shell atual; nao reduzir sem motivo.
- Densidade compacta: tabelas, lists, nav, dashboards operacionais.
- Densidade confortavel: formularios, detalhe de cliente, cards de decisao.

### Light mode e dark mode

Tema inicial: dark mode e o padrao quando `:root` nao tem `.light`.

Relacao de superficies:

- `bg-background`: fundo da aplicacao.
- `bg-surface`: blocos baixos, filtros, inputs.
- `bg-card`: cards e containers principais.
- `bg-card-elevated`: hover/elevacao discreta.
- `border-border`: divisao estrutural.
- `text-foreground`: texto principal.
- `text-muted-foreground`: texto secundario.

Dark mode:

- Nunca usar preto puro como todos os niveis.
- Cards precisam se distinguir do background por contraste de superficie e borda.
- Sombras devem ser discretas; profundidade vem mais de contraste do que de blur pesado.
- Roxo (`--primary`) e acento, nao fundo de area grande.

Light mode:

- Fundo pode ser claro, mas cards nao podem sumir no background.
- Bordas ficam mais importantes para definir containers.
- Texto secundario precisa manter contraste legivel.
- Sombras devem ser suaves; nada de card "flutuando" pesado.

Estados semanticos:

- `success`: sucesso, ativo, saudavel, realizado.
- `warning`: atencao, risco, pendente importante.
- `destructive`: erro, falha, vencido critico, acao destrutiva.
- `primary`: acao principal, item ativo, link importante.
- Nao usar cor sem significado.

### Componentes existentes

Usar antes de criar variacoes:

- `Card`: container padrao (`rounded-xl`, `border-border`, `bg-card`, `shadow-soft`, `p-4`).
- `Button`: variantes `primary`, `secondary`, `ghost`; tamanhos `sm`, `md`.
- `Badge`: tons `neutral`, `brand`, `success`, `warning`, `destructive`.
- `Tabs`: navegacao secundaria horizontal com scroll.
- `SectionHeader`: titulo/caption/acao em card ou secao.
- `LoadingState`: loading de pagina/secao central.
- `ErrorState`: erro de pagina/secao.
- `EmptyState`: vazio com borda tracejada e descricao curta.

`BackgroundBeams` existe, mas deve ser excecao. Nao usar decoracao animada em telas operacionais.

## Navegacao

Sidebar:

- Usar para modulos principais persistentes.
- Agrupar por areas: Visao Geral, Operacao, Gestao.
- Item ativo usa `bg-sidebar-accent`, indicador lateral e icone em `text-primary`.
- Sidebar item: `rounded-lg`, `px-2.5`, `py-2`, `text-sm`.
- Rodape da sidebar concentra usuario, notificacoes, tema e logout.
- Nao duplicar no topbar as mesmas acoes do rodape.

Topbar:

- Usar como contexto da rota atual e gatilho mobile.
- Manter altura compacta (`h-14`).
- Nao virar area de botoes globais.

Tabs:

- Usar para navegacao secundaria dentro de uma entidade ou modulo.
- Tabs devem ser horizontais, com scroll em mobile.
- Nao usar tabs para substituir filtros.

Breadcrumbs:

- Usar quando o usuario desce hierarquia: lista -> detalhe -> subdetalhe.
- Nao repetir breadcrumb quando o header ja deixa o contexto obvio.

Acoes:

- No maximo 1 acao primaria por contexto.
- Ate 2 acoes secundarias visiveis; demais vao para overflow.
- Acoes destrutivas nunca sao destaque principal.
- Icones devem vir de `lucide-react` quando existir equivalente.

## Loading, erro e empty state

Loading:

- Usar `LoadingState` para carregamento inicial de pagina ou aba.
- Usar skeleton apenas quando a estrutura da tela ja e conhecida e o loading parcial evita layout shift.
- Botao em submit deve bloquear clique repetido e indicar estado.
- Loading parcial deve ficar dentro da secao afetada, nao bloquear a pagina inteira.

Error:

- Erro de pagina/secao usa `ErrorState`.
- Erro de formulario fica inline perto do formulario.
- Erro de integracao deve mostrar mensagem amigavel e, quando houver, causa operacional.
- Mensagem tecnica completa fica em log; UI nao deve expor stack trace, token, query ou payload sensivel.
- Sempre que fizer sentido, oferecer "Tentar novamente".

Empty state:

- Primeira utilizacao: explicar proxima acao.
- Nenhum resultado de filtro: dizer que o filtro nao encontrou itens e permitir limpar.
- Nenhum dado no periodo: dizer que nao ha dados para o periodo selecionado.
- Integracao nao configurada: orientar conectar/sincronizar.
- Permissao insuficiente: usar `AccessDeniedPlaceholder` ou mensagem equivalente.

Diferenciar:

- Zero real: mostrar `0` quando existe linha/dado sincronizado.
- Sem dados: nao existe linha/base no periodo.
- Indisponivel: fonte ainda nao existe ou modulo nao implementado.
- Ainda nao configurado: depende de conexao/setup.
- Erro: houve falha na tentativa de carregar ou executar.

## Feedback de sucesso

Lacuna atual: sistema global de notificacoes/toast ainda nao implementado.

Ate existir toast global:

- Usar mensagem inline em formulario/secao quando a acao muda dado.
- Usar estado temporario de botao para submit/sync.
- Evitar feedback silencioso em criar, editar, sincronizar, anexar e salvar.
- Mensagem curta: "Salvo.", "Sincronizado.", "Documento anexado.".
- Duracao futura de toast: 3 a 5 segundos.
- Toast futuro deve ser usado para sucesso transversal; erro continua com contexto na secao.

## Regras por tipo de pagina

### Dashboard

- Cockpit operacional, nao vitrine.
- No maximo 4 KPIs principais no topo.
- Ordem: KPIs -> atencao necessaria/saude -> performance real -> atividade recente.
- Performance so mostra numero/grafico com dado real.
- Nao repetir a tela completa de Performance dentro do Dashboard.

### Listagens

- Cabecalho compacto: titulo, contagem e 1 acao primaria.
- Filtros colados ao conteudo que filtram.
- Tabela/lista densa como padrao para comparacao.
- Cards so quando o item tem conteudo rico.

### Detalhe do cliente

- Entity header compacto: nome, status, 1-2 badges, metadado curto.
- No maximo 1 acao primaria visivel.
- Indicadores do topo: 3-6, compactos.
- Tabs por frequencia de uso.
- Visao geral deve mostrar contexto e proxima acao sem virar duplicacao das abas.

### Tabelas

- Linhas compactas.
- Cabecalho discreto.
- Status semantico.
- Numeros alinhados a direita.
- Acoes agrupadas na direita ou em overflow.

### Integracoes

- Ordem: provider -> conta -> status -> ultima sync -> erro -> acao.
- Estados: conectado, sincronizando, desconectado, erro.
- Uma acao primaria por provider.
- Nunca expor tokens, secrets ou detalhes internos.

### Financeiro

- Valor e vencimento sao prioridade.
- Moeda consistente e alinhada.
- Periodo sempre explicito.
- Admin only conforme regra do produto.

## Antipadroes proibidos

- Card para cada informacao isolada.
- Card dentro de card sem necessidade.
- Seis KPIs iguais competindo no topo.
- Sombras fortes.
- Roxo como fundo de area grande.
- Bordas em todos os elementos.
- Areas vazias enormes.
- Texto explicativo longo permanente.
- Cinco botoes no cabecalho.
- Informacao duplicada.
- Filtro que nao altera query/resultado.
- Metrica inventada sem fonte real.
- Copiar literalmente Attio, Linear, Stripe ou Vercel.

## Referencias

- Layouts canonicos: `references/canonical-layouts.md`.
- Checklist objetivo: `references/approval-checklist.md`.
- Auditoria visual: `docs/product/reference-images/README.md`.
