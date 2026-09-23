# ADR-0006: Classificação de certeza como ponto de qualidade e fim dos travessões

- **Status**: Aceito
- **Data**: 2026-09-22
- **Decisores**: Ruan Braz

## Contexto

A base de conhecimento da Overlens está em transição declarada. Para evitar que exploração estratégica seja lida como decisão tomada, a regra `.claude/rules/tese-atual.md` tornou obrigatório classificar toda afirmação estratégica em cinco níveis de certeza: DEFINIDO, EM VALIDAÇÃO, HIPÓTESE, HISTÓRICO e PENDENTE.

Essa marcação foi implementada como texto por extenso dentro do corpo das páginas, em formas como `DEFINIDO.`, `Status: EM VALIDAÇÃO.`, `HIPÓTESE, sem oferta estruturada.` e `[EM VALIDAÇÃO]`, sempre em negrito. Três problemas apareceram com o uso:

- **Ruído de leitura.** A marcação ocupa a posição mais visível do parágrafo, em caixa alta e negrito, competindo com o conteúdo que deveria apenas qualificar.
- **Formato instável.** Sem um formato único, a mesma informação foi escrita de pelo menos seis maneiras diferentes ao longo da base, o que impede tratamento programático, contagem e auditoria.
- **Origem invisível.** A marcação diz o grau de certeza, mas não diz se existe fonte declarada. Uma afirmação DEFINIDO com link para a diretriz que a originou e outra DEFINIDO sem nenhuma origem eram indistinguíveis.

Em paralelo, a base e a interface acumularam travessões (em dash, U+2014) e meias-riscas (en dash, U+2013) em profusão: títulos, frontmatter, células de tabela, listas e texto corrido. O travessão é pontuação de ênfase; usado como conector padrão, ele achata a prosa, dificulta a leitura em telas estreitas e esconde a estrutura real da frase.

## Problema

Como registrar o grau de certeza de uma afirmação sem poluir o texto, com um formato único que possa ser lido por pessoas, pelo site e por agentes, e que explicite quando existe fonte declarada?

## Decisão

Vamos substituir a classificação por extenso por uma **tag inline** renderizada como **ponto de qualidade**, e eliminar os travessões da base e da interface.

### 1. A classificação vira uma tag inline

A marcação passa a ser uma tag no markdown:

```
<dado q="A" />
<dado q="B" nota="Direção testada em duas turmas." />
<dado q="A" fonte="TRU/changes.md" />
<dado q="C" nota="Candidato mais forte." fonte="https://exemplo.com/pesquisa" />
```

`q` é obrigatório e vai de `A` a `E`. `nota` é opcional e leva uma frase curta de qualificação. `fonte` é opcional e só aparece quando o documento **declara** de onde a informação veio: um link, um arquivo da própria base, uma pesquisa nomeada, um relatório ou uma métrica identificada. Nunca se inventa fonte: a ausência de fonte é informação verdadeira sobre a base.

A tag é inline. Ela abre o parágrafo, abre o item de lista ou ocupa a célula da tabela, e nunca fica sozinha numa linha separada do texto que classifica.

### 2. Cinco letras, de A a E

| Bolinha | Significa | Quando usar |
| :---- | :---- | :---- |
| **A** | DEFINIDO | Decisão tomada e atualmente válida |
| **B** | EM VALIDAÇÃO | Direção em teste, com evidência parcial |
| **C** | HIPÓTESE | Possibilidade ainda não validada |
| **D** | HISTÓRICO | Já foi verdadeiro; não representa a direção atual |
| **E** | PENDENTE | Precisa existir e ainda não existe |

A ordem de `A` a `E` é confiabilidade como verdade atual, não importância. Na dúvida entre `A` e `B`, vale `B`. Os rótulos antigos continuam existindo como vocabulário de conversa e aparecem no tooltip, mas não são mais escritos no corpo do texto.

### 3. A letra é o sinal; a cor apenas reforça

No site, cada letra aparece como um ponto colorido com tooltip. A letra dentro do ponto carrega o significado sozinha, de modo que a informação não depende de percepção de cor. O tooltip abre o rótulo, o significado, a nota e a origem.

### 4. O ponto de fonte

Quando a afirmação tem `fonte`, um segundo ponto marcado **F** aparece ao lado. Se a fonte for uma URL, o ponto vira link; caso contrário, o tooltip mostra a referência. Isso torna visível, numa varredura da página, quais afirmações se apoiam em algo declarado e quais não.

### 5. Fim dos travessões

O travessão (em dash, U+2014) e a meia-risca (en dash, U+2013) saem da base de conhecimento e da interface. A substituição não é mecânica por hífen: o travessão some e a frase se reorganiza com vírgula, parênteses, dois-pontos, ponto final ou o separador ` · ` já usado em enumerações curtas, conforme a função que ele exercia. O sentido não muda, e nenhuma informação nova é inventada para costurar a frase. Continuam válidos o hífen comum e o caractere de box drawing U+2500, usado em separadores e diagramas.

## Alternativas consideradas

- **Manter a marcação por extenso e apenas padronizar o formato**: descartada. Resolve a instabilidade de formato, mas não o ruído de leitura nem a invisibilidade da origem.
- **Mover a classificação para o frontmatter da página**: descartada. A certeza é propriedade da afirmação, não do documento. Uma mesma página costuma conter decisões firmes, direções em teste e lacunas declaradas.
- **Usar apenas cor, sem letra**: descartada. Informação transmitida somente por cor falha em acessibilidade e não sobrevive a cópia de texto, impressão ou leitura por agentes.
- **Usar emoji ou símbolo (✅, ⚠️, ❓)**: descartada. Símbolos carregam julgamento de valor, e a escala não é de bom a ruim: `E` não é pior que `A`, é outra coisa.
- **Substituir travessão por hífen**: descartada explicitamente. Trocaria um sinal por outro sem resolver a estrutura da frase, e o hífen tem função própria na ortografia.

## Consequências

- Toda página nova nasce com a notação `dado`. As regras normativas (`.claude/rules/tese-atual.md` §11 e `.claude/rules/padrao-paginas.md`), o `CLAUDE.md`, os agentes de escrita, revisão e validação e as skills do pipeline passam a ensinar a notação nova. A marcação por extenso não deve mais ser produzida.
- A classificação ganha tratamento programático: contar, auditar e filtrar afirmações por grau de certeza passa a ser possível.
- Surge um risco novo: a tag é fácil de escrever e fácil de esquecer. O checklist do validador trata a classificação como item eliminatório, e `nota` e `fonte` precisam ser revisadas para não degradarem em texto genérico.
- Fonte declarada passa a ser um compromisso visível. Afirmação sem `fonte` fica explicitamente sem fonte, o que é desconfortável e correto.
- A escrita sem travessão exige mais atenção editorial do que a pontuação de conveniência que ele oferecia.

### Implementação

- `website/src/lib/dado.ts`: tipo `DadoGrade`, tabela `DADO_GRADES` (rótulo, significado e classe do ponto por letra), normalização da letra e as três transformações do markdown. `normalizeDadoTags` fecha a tag antes do parse, porque `dado` não é elemento vazio conhecido do HTML e o parser engoliria o resto do parágrafo. `expandDadoTags` devolve a letra ao formato textual (`[DEFINIDO · nota · fonte: ...]`) e `stripDadoTags` remove a tag sem rastro.
- `website/src/components/dado-badge.tsx`: o ponto em si, com tooltip, rótulo acessível e o segundo ponto **F** quando há fonte.
- `website/src/components/markdown-renderer.tsx`: normaliza as tags e mapeia o elemento `dado` para `DadoBadge` na renderização.
- `website/src/components/doc-editor.tsx`: converte a tag para o marcador `{{dado:...}}` na carga e de volta para tag na serialização, preservando a marcação em edições feitas pela interface.
- `website/src/lib/ai/docs-index.ts`: aplica `expandDadoTags` antes de indexar, porque um modelo lê melhor `[DEFINIDO]` do que uma tag HTML.

## Critérios de sucesso

- Zero ocorrências de em dash (U+2014) e en dash (U+2013) na base de conhecimento, em `.claude/`, em `docs/` e no `CLAUDE.md`.
- Zero ocorrências das marcações por extenso em negrito (DEFINIDO, EM VALIDAÇÃO, HIPÓTESE, HISTÓRICO, PENDENTE) fora das tabelas-legenda que explicam o sistema.
- Toda tag `dado` da base carrega um `q` válido de `A` a `E`.
- Páginas escritas após esta decisão chegam à validação já classificadas, sem correção manual da notação.
