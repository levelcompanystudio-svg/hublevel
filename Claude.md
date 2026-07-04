# Claude.md

## Visao Geral

Este arquivo orienta assistentes de IA e colaboradores que forem trabalhar neste projeto. Use-o como fonte rapida de contexto antes de alterar codigo, documentacao ou estrutura do produto.

## Estado Atual do Projeto

- Nome do projeto: PROJETO 1
- Produto: a definir
- Stack tecnica: a definir
- Status: documentacao inicial criada antes da implementacao

Atualize esta secao assim que o projeto tiver codigo, dependencias, scripts, arquitetura ou decisoes tecnicas relevantes.

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
