# Checklist de aprovacao

Referenciado por `../SKILL.md`. Usar antes de aprovar qualquer tela nova ou alterada.

## Escopo e arquitetura

- [ ] A tela alterou apenas o escopo autorizado?
- [ ] Nenhuma regra de negocio foi alterada sem pedido explicito?
- [ ] Nenhuma query nova foi criada sem necessidade?
- [ ] Nenhuma metrica foi inventada sem fonte real?
- [ ] Filtros visuais realmente alteram query ou resultado?
- [ ] Permissoes por role continuam respeitadas?

## Tokens e consistencia visual

- [ ] A tela usa tokens semanticos (`bg-background`, `bg-card`, `text-foreground`, `border-border`, etc.)?
- [ ] Light e dark mantem contraste legivel?
- [ ] Cards se diferenciam do background nos dois temas?
- [ ] Roxo (`--primary`) aparece apenas como acento?
- [ ] Estados semanticos usam `success`, `warning`, `destructive`, `primary` de forma consistente?
- [ ] Nao ha cor hardcoded quando existe token equivalente?

## Tipografia

- [ ] Existe no maximo 1 page title dominante?
- [ ] Tipografia respeita `text-h1`, `text-h2`, `text-h3`, `text-caption` quando aplicavel?
- [ ] Labels usam tamanho pequeno e hierarquia consistente?
- [ ] Helper text usa `text-muted-foreground` e nao compete com conteudo principal?
- [ ] Valores KPI sao legiveis sem parecer hero/landing page?
- [ ] Numeros comparaveis estao alinhados e formatados de forma consistente?

## Radius e espacamento

- [ ] Radius respeita os tokens (`rounded-md`, `rounded-lg`, `rounded-xl`)?
- [ ] Cards comuns nao usam radius exagerado?
- [ ] Badges/pills pequenas podem usar `rounded-full` sem contaminar o resto da UI?
- [ ] Espacamento usa multiplos claros da escala base de 4px?
- [ ] Card padrao fica em torno de `p-4`?
- [ ] A tabela esta compacta o suficiente para operacao diaria?
- [ ] O conteudo nao esta estreito demais em tela larga?
- [ ] Nao ha area vazia grande sem funcao?

## Navegacao e acoes

- [ ] Sidebar respeita grupos oficiais e permissoes?
- [ ] Item ativo esta claro sem ficar chamativo demais?
- [ ] Tabs sao usadas apenas para navegacao secundaria, nao como filtro disfarçado?
- [ ] Breadcrumb aparece apenas quando ajuda a entender hierarquia?
- [ ] Existe no maximo uma acao primaria por contexto?
- [ ] Acoes secundarias nao competem visualmente com a primaria?
- [ ] Acoes destrutivas nao sao destaque principal?
- [ ] Mais de 2 acoes secundarias foram movidas para overflow/menu?

## Estados

- [ ] Loading inicial foi tratado?
- [ ] Loading parcial evita layout shift quando possivel?
- [ ] Botao em submit/sync fica bloqueado durante execucao?
- [ ] Erro de pagina/secao usa mensagem controlada?
- [ ] Erro de formulario aparece perto do formulario?
- [ ] Erro de integracao mostra causa amigavel sem expor detalhe sensivel?
- [ ] Empty state representa corretamente a situacao?
- [ ] A tela diferencia zero real, sem dados, indisponivel, nao configurado e erro?
- [ ] Existe feedback de sucesso inline ou temporario quando a acao conclui?

## Responsividade

- [ ] Mobile funciona sem overlap?
- [ ] Notebook funciona sem conteudo espremido ou largura desperdicada?
- [ ] Desktop usa a largura disponivel sem ficar vazio demais?
- [ ] Tabelas usam scroll horizontal quando necessario?
- [ ] Tabs rolam horizontalmente em mobile?
- [ ] Acoes continuam acessiveis em telas estreitas?

## Criterios objetivos de produto consolidado

- [ ] A tela tem hierarquia clara: principal, secundario, apoio.
- [ ] A tela prioriza decisao/acao, nao decoracao.
- [ ] Componentes existentes foram reutilizados antes de criar variacao.
- [ ] Conteudo vazio nao parece bug.
- [ ] Cada numero exibido tem fonte real e periodo/contexto claro.
- [ ] A tela parece parte do HubLevel, nao de um template generico.
- [ ] Referencias externas foram usadas como principio estrutural, sem copia literal.
