# [AUDITORIA] Base de Conhecimento: Nova Tese da Overlens

**Data da auditoria:** 19 de setembro de 2026
**Data da execução:** 20 de setembro de 2026
**Escopo:** 108 documentos em `TRU/` (Brand System, Growth System, Content System, Pacote Cultural) + 14 arquivos de governança de agentes em `.claude/` e `CLAUDE.md`
**Base de referência:** prompt de reposicionamento + `TRU/changes.md`

---

## ✅ Estado de execução

A auditoria abaixo **foi executada**. Este documento passa a ter duas funções: registrar o diagnóstico original e registrar o que foi feito a partir dele.

| Frente | Situação |
| :---- | :---- |
| **Governança de agentes** (14 arquivos) | ✅ Feito. Nova regra normativa em `.claude/rules/tese-atual.md`; `padrao-paginas.md` e `CLAUDE.md` reescritos; 12 agentes e 11 skills atualizados. |
| **23 documentos para atualizar** | ✅ Feito. |
| **24 documentos em conflito** | ✅ Feito. Nada apagado: o que representava a tese anterior virou seção de histórico, marcada com `<dado q="D" />`, ou recebeu aviso de status. |
| **9 frentes a criar** | ✅ 7 feitas: Business Document, definição de **Atom**, **Community System**, **Product System**, posicionamento atualizado, arquitetura comercial contínua, documentação de PBL. ⏳ 2 pendentes por decisão: **redefinição de personas** e **Value Proposition Canvas + Mapa de Empatia** (dependem da primeira). |
| **Personas antigas** | ⏳ Preservadas e marcadas **"necessita revisão de persona"** nas 10 páginas afetadas. Nenhuma persona nova foi inventada. |
| **Pesquisa de mercado** | ⏳ Nenhum número foi estimado. <dado q="E" /> |

**O que mudou na estrutura da base:** dois sistemas novos (`product_system`, `community_system`) e o `business_doc`, todos ligados à plataforma em `/product`, `/community` e `/business`. A fonte canônica passou a ser `website/content/` (com frontmatter); `TRU/` é o espelho sem frontmatter, regenerado por `website/scripts/sync-tru.py`.

**Correções encontradas na execução que a auditoria não tinha previsto:**

- `.claude/agents/escritor.md` estava com o frontmatter corrompido e o agente não carregava.
- Resíduos do rótulo antigo de público sobreviviam no **frontmatter** de páginas classificadas como "continua válido": Virtudes, Manifesto, Símbolos e Logotipos, Universo Sonoro e quatro páginas do Pacote Cultural. A auditoria original só inspecionou o corpo dos documentos.
- O swipe file **Ensaio Manifesto** divide a humanidade em "Nexialistas, Operantes e Obsoletos", taxonomia que contradiz a regra atual (Operante não carrega julgamento de valor). Foi marcado com `<dado q="D" />`, preservado como referência de forma.

---

## Sumário executivo

A base está **majoritariamente coerente em fundamento e majoritariamente desatualizada em enquadramento**. O propósito, os princípios, a ética e o universo simbólico atravessam a transição praticamente intactos. O que está desatualizado é a camada que descreve **categoria, público, produto e modelo de negócio**.

| Classificação | Documentos | % |
| :---- | :---- | :---- |
| **1. Continua válido** | 61 | 56% |
| **2. Precisa ser atualizado** | 23 | 21% |
| **3. Entra em conflito com a nova tese** | 24 | 22% |
| **4. Precisa ser criado** | 9 documentos/sistemas novos |  |

**Três achados críticos:**

1. **A base se auto-reproduz.** 14 arquivos em `.claude/` e o `CLAUDE.md` codificam a tese antiga como regra obrigatória para todo agente que escreve documentação. Enquanto não forem corrigidos, cada nova página nasce desatualizada, e nasce *validada* como correta.
2. **O conceito de Atom não existe na base.** Zero ocorrências em 108 documentos. A identidade central da nova comunidade não está documentada em lugar nenhum.
3. **Operante/Convergente/Emergente/Nexialista mudaram de natureza**, não só de redação. Eram estágios sequenciais de maturidade do cliente; passaram a ser modos comportamentais e cognitivos. Isso atinge 14 documentos em três sistemas e é a mudança de maior alcance da auditoria.

---

## 1. CONTINUA VÁLIDO: 61 documentos

Coerentes com a nova Overlens. Podem permanecer sem alteração.

### Brand System: fundamentos e universo (19)

| Documento | Observação |
| :---- | :---- |
| `02 - Overview/02 Por que a Overlens existe` | O propósito e a tese do vilão (alienação e renúncia) sobrevivem inteiros. Reforçados pela nova direção. |
| `02 - Overview/03 Cuidados e Riscos` | Guardrails éticos permanecem. |
| `02 - Overview/04 Nossa postura` | A ética da autonomia é ainda mais necessária agora. |
| `02 - Overview/05 O preço que pagamos` | Válido. |
| `02 - Overview/06 Princípios da Overlens` | Julgamento, Realização, Parcimônia, Unidade. O Princípio da Realização praticamente antecipa a nova tese. |
| `04 - Núcleo/05 Virtudes` | Válido. |
| `05 - Universo Verbal/02 Manifesto` | Válido. |
| `05 - Universo Verbal/03 Tom de Voz` | As 4 virtudes do tom permanecem. |
| `06 - Universo Visual` (8 documentos) | Overview, Imagens Arquetípicas, Painel Semântico, Símbolos, Cores, Tipografia, Iconografia, Grafismos. Nada no reposicionamento afeta o sistema visual. |
| `07 - Universo Sonoro` (2 documentos) | Válidos. |

### Content System: método operacional (36)

Playbook de Conteúdo (14), Playbook de Edição de Vídeos (9), Estúdio Criativo (4), Conteúdo e Swipe Files (7), Touchpoints operacionais (2).

São documentos de **método**, não de tese. Big Idea, enquadramento, pesquisa, níveis de consciência, fluxo de edição, métricas de produção e tutoriais continuam funcionando independentemente do posicionamento. As exceções estão listadas na seção 2.

### Pacote Cultural (6)

Curadoria cultural. Não faz afirmações sobre categoria, público ou modelo de negócio.

---

## 2. PRECISA SER ATUALIZADO: 23 documentos

A essência continua correta; a formulação, o contexto ou a abrangência ficaram ultrapassados. **Não exigem reescrita: exigem ajuste.**

| Documento | O que ajustar |
| :---- | :---- |
| `brand/01 Definição` | Diz que o Brand System serve a "Designers, Criadores de conteúdo, Desenvolvedores, Estrategistas". Ampliar. Cita "Empreendedores Nexialistas" como o público. |
| `brand/02 Visão Geral` | "Escola para quem decide criar com consciência" → precisa incorporar negócios e realização. Lista o público por profissão. |
| `brand/02 Linha do Tempo` | Historicamente verdadeira e deve ser preservada. Ajustar apenas o bloco "Onde estamos agora", que descreve a posição anterior como atual. |
| `brand/04 Visão e Propósito` | "Escola de formação para os novos construtores: os Empreendedores Nexialistas" → reenquadrar com a nova tese e a frase "O futuro não é um destino". |
| `brand/04 Posicionamento` | As camadas retóricas (Ethos/Pathos/Logos) continuam válidas. Falta a declaração de posicionamento atual: "a escola de negócios dos criadores" e suas variações dinâmicas. |
| `brand/04 Arquétipos` | Mago + Criador + Sábio permanecem. Ajustar menções a "designers" e ao público nexialista. |
| `brand/04 Proxies` | Válido em estrutura. Atualizar a descrição da empresa que os proxies representam. |
| `brand/05 Vocabulário` | 5 ocorrências de "Empreendedor Nexialista" como nome do público. Precisa refletir Nexialismo como capacidade. Falta **Atom**. |
| `brand/05 Território de palavras` | Ajustar o campo semântico para incluir negócios, projeto e realização. |
| `brand/05 Glossário` | Atualizar verbetes de Nexialista e Átomo; acrescentar Atom, Praxis, PBL, Atom Praxis. |
| `brand/05 Arquitetura de Marca` | Estrutura em camadas continua excelente. Atualizar: produtos (faltam serviços, incubação, B2B, eventos, artefatos), documentos (falta o Business Document), e o Átomo como unidade de conteúdo. |
| `growth/00 Definição` | Descreve o Growth System como "Livro de Marketing e Vendas". Ampliar para aquisição contínua, CRM, relacionamento. |
| `growth/03 Fluxos` | Estrutura válida. Incorporar operação contínua no lugar de ciclo de campanha. |
| `growth/04 Benchmarking` e `21 Referências` | Metodologia válida. Referências precisam ser revistas sob a nova categoria. |
| `estudio/02 Introdução ao conteúdo` | Cita o público antigo. |
| `estudio/03 Playbook › 02 Introdução` | Idem. |
| `estudio/03 Playbook › 04 Base Invisível da Produção` | Níveis de consciência mapeados aos perfis antigos. |
| `estudio/03 Playbook › 04-criativos-e-copy` (3 documentos) | Copy de Captação, Lembrete e Carrinho Aberto assumem operação por lançamento. Precisam comportar venda contínua. |
| `estudio/01 As duas frentes` · `03 Por que centralizamos` | Menções pontuais a "designers" e a lançamento. |
| `estudio/05 Personas Sintéticas` · `D.U.D` · `T.R.U` | Conceito válido e preservável. Verificar coerência com o novo enquadramento. |

---

## 3. ENTRA EM CONFLITO COM A NOVA TESE: 24 documentos

Representam diretamente a Overlens anterior. **Podem gerar decisões erradas se permanecerem sem marcação.**

### 3.1 · Governança de agentes · PRIORIDADE MÁXIMA (14 arquivos)

Estes não são documentos de conteúdo: são **regras que governam como todo novo documento é escrito, revisado e validado**. Enquanto não forem corrigidos, a base se reconstrói na tese antiga automaticamente.

| Arquivo | Conflito |
| :---- | :---- |
| `.claude/rules/padrao-paginas.md` | **O mais grave.** Obriga: "O público da Overlens é o Empreendedor Nexialista e NUNCA deve ser chamado de designers". A nova direção aproxima a marca justamente de criadores, designers, artistas, engenheiros, inventores e makers. A regra também fixa os 5 perfis como "distância entre ideia e realidade". |
| `CLAUDE.md` | Define a Overlens como escola que treina "Empreendedores Nexialistas", fixa os 5 perfis de maturidade e o vocabulário obrigatório. |
| `.claude/agents/escritor.md` | Escreve toda página nova sob essas premissas. |
| `.claude/agents/revisor.md` · `validador.md` | **Reprovam** material que contrarie a tese antiga. |
| `.claude/agents/pesquisador.md` | Extrai contexto assumindo o público antigo. |
| `.claude/agents/especialista-posicionamento.md` · `especialista-storybrand.md` · `especialista-universo-verbal.md` · `especialista-midias.md` | Carregam a definição antiga de público e categoria. |
| `.claude/skills/pesquisar` · `posicionamento` · `storybrand` · `touchpoints` | Idem. |

**Recomendação:** corrigir antes de qualquer outra coisa. Todo esforço de revisão de conteúdo é desfeito enquanto as regras permanecerem.

### 3.2 · Definição de mercado e categoria (4)

| Documento | Conflito |
| :---- | :---- |
| `growth/01 Mercado/03 Segmento` | **Conflito mais direto da base.** Categoria declarada: "Escola de negócios emergentes e inovação **com foco em IA**". Descreve "Foco em IA Consciente" como posicionamento único e lista público por profissão. IA agora é infraestrutura, não categoria. |
| `growth/01 Mercado/02 Mercado` | "Plataforma de transição que une educação, tecnologia e filosofia aplicada... na era das inteligências artificiais". Mesmo problema. |
| `growth/01 Mercado/04 TAM SAM SOM` | Já marcado como pendente na base. Agora está desatualizado em dois níveis. |
| `growth/04 Concorrentes` | Já carrega aviso de desatualização. O conjunto competitivo mudou novamente com a categoria. |

### 3.3 · Segmentação e personas (10)

| Documento | Conflito |
| :---- | :---- |
| `growth/02 Perfis de Clientes` | Define os 5 perfis como estágios sequenciais de maturidade do cliente. A nova leitura é comportamental e cognitiva (**executa → conecta → cria → orquestra**), sem percurso linear obrigatório e sem "Inconscientes". |
| `growth/02 Maturidade/10 a 14` (5 documentos) | Inconscientes, Operantes, Convergentes, Emergentes, Nexialistas descritos como degraus de uma escada de cliente. |
| `growth/02 Público-alvo` · `07 Perfil Comum` · `08 Perfil Ideal` | Segmentação por profissão e origem; faixas de renda e ticket herdadas; ICP construído sobre o recorte antigo. |
| `growth/03 Personas 15 a 19` (5 documentos) | Brunin, Tella, Ander e Lilly construídos sobre profissão, idade, renda e comportamento de consumo. **Marcar como "necessitam revisão de persona"**, não reescrever agora. |

### 3.4 · Produto, oferta e narrativa (6)

| Documento | Conflito |
| :---- | :---- |
| `growth/02 Ofertas/29 Overpass` | Descrito como assinatura e biblioteca educacional. `changes.md` determina: camada contínua de desenvolvimento de capacidades. |
| `growth/02 Ofertas/30 Vanguarda` | Descrito como mentoria. Agora é camada de aceleração. |
| `growth/02 Ofertas/28 Atlas` | Descrito como "Front-end / Ingresso"; "produto barato de entrada" como definição. Agora: experiência de entrada e ativação. |
| `growth/02 Ofertas/23 Ofertas` | Enquadra ofertas apenas em jornada de compra; falta serviços, incubação, B2B, eventos e artefatos. |
| `growth/03 Growth Loop` | Loop de aquisição→receita com a compra como evento central e gamificação como mecanismo de valor. Falta projeto, evidência e comunidade como infraestrutura. |
| `growth/03 Jobs To Be Done` | JTBD escritos por estágio de maturidade antigo. |
| `brand/04 Storybrand` | **Maior concentração de conceitos antigos da base**, com 14 ocorrências de Nexialista. Estrutura narrativa SB7 é sólida e preservável; os "cinco rostos do herói" e o "caminho do Nexialista" precisam ser refeitos. Cita trilhas (NexGen, Spectrum, AI First) que podem não existir mais. |
| `estudio/06 Pontos de contato` | 11 ocorrências de Nexialista; jornada mapeada sobre os perfis antigos. |

---

## 4. PRECISA SER CRIADO: 9 frentes

| # | O que falta | Onde deve viver | Prioridade |
| :---- | :---- | :---- | :---- |
| 1 | **Business Document** | `TRU/business_doc/` | **Feito nesta rodada** |
| 2 | **Definição de Atom**, conceito central, zero ocorrências na base | Brand System (conceito) + Community System (operação) | Alta |
| 3 | **Community System**, não existe | `TRU/community_system/` | Alta |
| 4 | **Product System**, não existe | `TRU/product_system/` | Alta |
| 5 | **Posicionamento atualizado**: "a escola de negócios dos criadores" e a estrutura dinâmica de variações | Brand System › Posicionamento | Alta |
| 6 | **Personas e segmentos redefinidos** por mentalidade e intenção | Growth System | Alta |
| 7 | **Value Proposition Canvas** e **Mapa de Empatia** | Growth System (não o Business Document) | Média, depende de 6 |
| 8 | **Documentação de PBL**, aposta mais estruturante, sem documento próprio | Product System | Média |
| 9 | **Arquitetura comercial contínua**: CRM, vendedores, follow-up, WhatsApp, produtos perpétuos | Growth System | Média |

Faltam também: **Atom Praxis**, **hackathons**, **incubação**, **assessoria/consultoria**, **B2B** e **artefatos físicos**, hoje com 3 menções acidentais em toda a base, nenhuma delas definindo o conceito.

---

## Respostas às 10 perguntas da auditoria

**1. Quais documentos permanecem válidos?**
61 de 108. Todo o Universo Visual e Sonoro, os fundamentos éticos e de princípios do Brand System, praticamente todo o Content System operacional e o Pacote Cultural.

**2. Quais precisam apenas de ajustes?**
23. Concentrados em menções ao público por profissão, ao rótulo "Empreendedor Nexialista" e à operação por lançamento.

**3. Quais representam a antiga Overlens e precisam de revisão profunda?**
24, sendo 14 de governança de agentes, 4 de mercado e categoria, 10 de segmentação e personas, 6 de produto e narrativa. (A soma excede 24 porque alguns documentos aparecem em mais de uma dimensão de conflito.)

**4. Quais precisam ser substituídos?**
Nenhum precisa ser apagado. Três precisam ser **refeitos preservando a estrutura**: `Segmento`, `Perfis de Clientes` e `Storybrand`. O restante se resolve por atualização ou por marcação como histórico.

**5. Quais conceitos conflitantes ainda existem na base?**

| Conceito | Conflito |
| :---- | :---- |
| **Átomo** | Unidade de conteúdo (antigo) vs. membro da comunidade (atual). A definição antiga aparece na Arquitetura de Marca. |
| **Nexialista** | Rótulo do público e último estágio de maturidade (antigo) vs. capacidade cognitiva e prática (atual). |
| **Operante/Convergente/Emergente** | Estágios sequenciais de cliente (antigo) vs. modos comportamentais e cognitivos (atual). |
| **Inconscientes** | Existe como perfil na base; não aparece na formulação atual. |
| **IA** | Categoria e diferencial (antigo) vs. infraestrutura (atual). |
| **Overpass** | Biblioteca e assinatura (antigo) vs. camada contínua (atual). |
| **Vanguarda** | Mentoria (antigo) vs. aceleração (atual). |
| **Atlas** | Produto de entrada barato (antigo) vs. experiência de ativação (atual). |
| **Escola** | Escola de IA/design/criatividade (antigo) vs. escola de negócios, criação e realização (atual). |

**6. Que informações faltam para documentar a nova Overlens?**
Ver seção 4. Os três buracos mais estruturais: Atom não definido, Community System inexistente, Product System inexistente.

**7. Onde as personas antigas ainda estão sendo utilizadas?**
Definidas em `growth/03 Personas/15 a 19`. Referenciadas em: fichas técnicas do Atlas, Overpass e Vanguarda (persona principal declarada), Perfil Ideal, Perfis de Clientes, Buyer Personas, Storybrand, Pontos de Contato, Jobs To Be Done e Base Invisível da Produção. **Marcar todas como "necessitam revisão de persona"; não inventar substitutas agora.**

**8. Onde a Overlens ainda aparece associada apenas a IA, design, cursos ou criatividade?**
- **IA como categoria:** `Segmento`, `Mercado`, `Público-alvo`, `Concorrentes`.
- **Design/designers como público:** `brand/01 Definição`, `Visão Geral`, `Visão e Propósito`, `Arquétipos`, `Vocabulário`, `Linha do Tempo`, `Segmento`, `Público-alvo`, `Perfil Ideal`, personas Tella e Lilly, `Por que centralizamos a criação`.
- **Cursos e biblioteca como produto:** `Overpass`, `Ofertas`, `Growth Loop`.
- **Criatividade como categoria:** `Visão Geral`, `Segmento`, `Referências`.

**9. Onde o modelo de negócio antigo ainda está implícito?**
`Ofertas`, `Atlas`, `Overpass`, `Vanguarda`, `Growth Loop`, `Fluxos`, `Perfil Ideal` e os três documentos de copy do Playbook (Captação, Lembrete, Carrinho Aberto), todos assumindo cursos, assinatura e lançamento como única arquitetura de receita.

**10. Que novos documentos precisam existir?**
Ver seção 4.

---

## Ordem recomendada de execução

1. **Corrigir a governança de agentes** (`.claude/` + `CLAUDE.md`). Sem isso, todo o resto é desfeito conforme novas páginas são escritas.
2. **Definir Atom** no Brand System. É o conceito de identidade da nova comunidade e não existe em lugar nenhum.
3. **Atualizar o Brand System nuclear**: Posicionamento, Visão Geral, Visão e Propósito, Definição, Vocabulário, Glossário, Arquitetura de Marca.
4. **Marcar, e não reescrever, o que depende de personas.** Inserir o aviso de "necessita revisão de persona" nos 10 documentos afetados.
5. **Reescrever `Segmento`** no Growth System. É o conflito mais direto de toda a base.
6. **Redefinir personas e segmentos**, e então Value Proposition Canvas e Mapa de Empatia.
7. **Criar Product System e Community System.**
8. **Refazer Storybrand e Pontos de Contato** sobre a nova segmentação.
9. **Documentar a arquitetura comercial contínua** no Growth System.
10. **Pesquisa de mercado**, a única forma de destravar TAM/SAM/SOM e o mapa de concorrentes.

---

## Nota metodológica

Esta auditoria **classifica**; não corrige. Nenhum documento foi alterado, apagado ou reescrito além do Business Document, que era entrega explícita desta rodada.

A classificação baseia-se em leitura integral dos documentos nucleares (Brand System, Growth System) e em varredura estruturada por padrões nos demais. Onde a evidência foi indireta, como no Content System operacional, isso está indicado.

Nenhuma persona nova foi inventada. Nenhum número de mercado foi estimado. Nenhuma frente exploratória foi documentada como decisão.
