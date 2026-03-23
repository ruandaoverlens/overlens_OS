# Workflow — Brand System da Overlens

## Sistema de Produção de Páginas

> Este documento descreve o processo completo para criar, revisar e validar cada página faltante do Livro de Branding da Overlens. O sistema foi desenhado para garantir que toda nova página seja indistinguível das já escritas — mesmo tom, mesma profundidade, mesma visão.

---

## Visão Geral

```mermaid
flowchart TD
    START([13 Páginas Faltantes]) --> DECIDE{Qual página?}

    DECIDE --> DOMAIN_SKILL[/Skill de Domínio/]
    DECIDE --> GENERIC[/Pipeline Genérico/]

    DOMAIN_SKILL --> PHASE1
    GENERIC --> PHASE1

    PHASE1[🔍 FASE 1: Pesquisa] --> APPROVAL1{Usuário aprova?}
    APPROVAL1 -->|Sim| PHASE2[✍️ FASE 2: Escrita]
    APPROVAL1 -->|Ajustar| PHASE1

    PHASE2 --> APPROVAL2{Usuário aprova?}
    APPROVAL2 -->|Sim| PHASE3[📋 FASE 3: Revisão]
    APPROVAL2 -->|Reescrever| PHASE2

    PHASE3 --> PRISMA_CHECK{Score P.R.I.S.M.A}
    PRISMA_CHECK -->|Aprovada| PHASE4[✅ FASE 4: Validação]
    PRISMA_CHECK -->|Com ajustes| AUTO_FIX[Aplicar ajustes] --> PHASE4
    PRISMA_CHECK -->|Reescrever| PHASE2

    PHASE4 --> VALID_CHECK{Score >= 90%?}
    VALID_CHECK -->|Aprovada| DONE[✅ Página Concluída]
    VALID_CHECK -->|Ressalvas| FIX[Corrigir itens] --> PHASE4
    VALID_CHECK -->|Reprovada| PHASE2

    DONE --> UPDATE[Atualizar TASKS]

    style PHASE1 fill:#1a1a2e,stroke:#4a9eff,color:#fff
    style PHASE2 fill:#1a1a2e,stroke:#f0a500,color:#fff
    style PHASE3 fill:#1a1a2e,stroke:#4a9eff,color:#fff
    style PHASE4 fill:#1a1a2e,stroke:#2d6a4f,color:#fff
    style DONE fill:#2d6a4f,stroke:#52b788,color:#fff
```

---

## As 4 Fases

### Fase 1 — Pesquisa (`/pesquisar`)

```mermaid
flowchart LR
    subgraph ENTRADA
        RAG[RAG_OVERLENS_COMPLETO.md]
        DOC[Documento Central]
        TASKS[TASKS_PAGINAS_FALTANTES.md]
    end

    subgraph AGENTE["🔍 Agente: pesquisador"]
        direction TB
        C[Conexões com doc central]
        O[Objetivo da página]
        N[Narrativa — onde se insere]
        T[Tom — mix das 4 virtudes]
        E[Estrutura — modelo similar]
        X[Exemplos e dados existentes]
        T2[Território — vocabulário]
        OUT[Output esperado]
    end

    subgraph SAIDA
        BRIEFING["[PESQUISA] Página.md"]
    end

    ENTRADA --> AGENTE
    AGENTE --> SAIDA

    style AGENTE fill:#1a1a2e,stroke:#4a9eff,color:#fff
```

**Agente**: `pesquisador`
**Framework**: C.O.N.T.E.X.T.O
**Input**: RAG + Documento Central + TASKS
**Output**: `[PESQUISA] Nome da Página.md`

**O que faz**:
- Lê o RAG completo para contexto
- Busca seções conectadas no documento central (com número de linha)
- Identifica a página mais similar já escrita (modelo de tom/estrutura)
- Pesquisa referências externas de branding quando relevante
- Mapeia vocabulário obrigatório
- Produz briefing estruturado

---

### Fase 2 — Escrita (`/escrever`)

```mermaid
flowchart LR
    subgraph ENTRADA
        BRIEFING["[PESQUISA] Página.md"]
        RAG[RAG_OVERLENS_COMPLETO.md]
        MODEL[Página modelo do doc central]
    end

    subgraph AGENTES["✍️ Agentes"]
        direction TB
        DOMAIN["Especialista de Domínio
        (storybrand, posicionamento,
        virtudes, verbal, visual,
        sonoro, mídias)"]
        WRITER["Agente: escritor
        Aplica 4 Virtudes do Tom"]
    end

    subgraph SAIDA
        PAGE["[PAGINA] Página.md"]
    end

    ENTRADA --> DOMAIN
    DOMAIN --> WRITER
    WRITER --> SAIDA

    style DOMAIN fill:#1a1a2e,stroke:#f0a500,color:#fff
    style WRITER fill:#1a1a2e,stroke:#f0a500,color:#fff
```

**Agentes**: `especialista-*` (domínio) + `escritor` (processo)
**Framework**: 4 Virtudes (Científica, Profunda, Provocativa, Inspiradora)
**Input**: Briefing de pesquisa + RAG + Página modelo
**Output**: `[PAGINA] Nome da Página.md`

**O que faz**:
- O especialista de domínio traz repertório teórico profundo (frameworks mundiais)
- O escritor garante que o output siga o padrão exato do Brand System
- Aplica vocabulário oficial, naming, metáforas do universo Overlens
- Verifica guardrails éticos antes de finalizar

---

### Fase 3 — Revisão (`/revisar`)

```mermaid
flowchart LR
    subgraph ENTRADA
        PAGE["[PAGINA] Página.md"]
        RAG[RAG_OVERLENS_COMPLETO.md]
        REFS[2+ páginas similares do doc central]
    end

    subgraph AGENTE["📋 Agente: revisor"]
        direction TB
        P["P — Propósito
        Cumpre seu papel?"]
        R["R — Ritmo e Tom
        4 virtudes na proporção certa?"]
        I["I — Integridade
        Coerente com fundamentos?"]
        S["S — Sinergia
        Dialoga com ecossistema?"]
        M["M — Mecânica
        Estrutura e formato corretos?"]
        A["A — Autenticidade
        Soa como Overlens?"]
    end

    subgraph SAIDA
        REVIEW["[REVISAO] Página.md"]
        VERDICT{Veredicto}
    end

    ENTRADA --> AGENTE
    AGENTE --> SAIDA

    VERDICT -->|"🟢 Aprovada"| OK[Seguir para Fase 4]
    VERDICT -->|"🟡 Com ajustes"| FIX[Aplicar correções]
    VERDICT -->|"🔴 Reescrever"| BACK[Voltar à Fase 2]

    style AGENTE fill:#1a1a2e,stroke:#4a9eff,color:#fff
```

**Agente**: `revisor`
**Framework**: P.R.I.S.M.A
**Input**: Página escrita + RAG + Páginas de comparação
**Output**: `[REVISAO] Nome da Página.md`

**Critérios por dimensão**:

| Dimensão | Pergunta-chave | Prioridade |
|----------|---------------|------------|
| **P**ropósito | A página cumpre seu papel no Brand System? | 6 |
| **R**itmo e Tom | As 4 virtudes estão na proporção certa? | 3 |
| **I**ntegridade | Coerente com fundamentos da Overlens? | 1 |
| **S**inergia | Dialoga com ecossistema existente? | 4 |
| **M**ecânica | Estrutura, formato, português corretos? | 5 |
| **A**utenticidade | Soa como Overlens ou genérico? | 2 |

**Classificação**: Verde (alinhado) / Amarelo (ajustes) / Vermelho (reescrita)

---

### Fase 4 — Validação (`/validar`)

```mermaid
flowchart LR
    subgraph ENTRADA
        PAGE["[PAGINA] Página.md"]
        REVIEW["[REVISAO] Página.md ✅"]
    end

    subgraph AGENTE["✅ Agente: validador"]
        direction TB
        C1["1. Conformidade Estrutural
        H1, H2, hierarquia, extensão"]
        C2["2. Conformidade de Tom
        Zero termos proibidos"]
        C3["3. Conformidade de Vocabulário
        Termos oficiais corretos"]
        C4["4. Conformidade Filosófica
        Propósito, guardrails, fragilidade"]
        C5["5. Conformidade Técnica
        Arquivo, links, ortografia"]
        C6["6. Integração
        Sem conflito com doc central"]
    end

    subgraph SAIDA
        REPORT["[VALIDACAO] Página.md"]
        SCORE{Score}
    end

    ENTRADA --> AGENTE
    AGENTE --> SAIDA

    SCORE -->|">= 90%"| PASS["✅ APROVADA"]
    SCORE -->|"75-89%"| WARN["⚠️ RESSALVAS"]
    SCORE -->|"< 75%"| FAIL["❌ REPROVADA"]

    style AGENTE fill:#1a1a2e,stroke:#2d6a4f,color:#fff
    style PASS fill:#2d6a4f,stroke:#52b788,color:#fff
    style FAIL fill:#6b1d1d,stroke:#e63946,color:#fff
```

**Agente**: `validador`
**Framework**: Checklist binário 6 categorias
**Input**: Página escrita + Revisão aprovada
**Output**: `[VALIDACAO] Nome da Página.md`

**Critérios de aprovação**:
- **✅ APROVADA**: Score >= 90% e zero itens filosóficos reprovados
- **⚠️ RESSALVAS**: Score >= 75% e filosofia OK
- **❌ REPROVADA**: Score < 75% OU qualquer item filosófico reprovado

---

## Mapa de Agentes

```mermaid
graph TB
    subgraph PIPELINE["AGENTES DE PROCESSO"]
        direction LR
        PESQ["🔍 pesquisador
        C.O.N.T.E.X.T.O"]
        ESCR["✍️ escritor
        4 Virtudes"]
        REV["📋 revisor
        P.R.I.S.M.A"]
        VAL["✅ validador
        Checklist 6x"]
        EXT["🧬 extrator-tom
        D.N.A Verbal"]
    end

    subgraph DOMAIN["AGENTES ESPECIALISTAS"]
        direction LR
        SB["📖 storybrand
        Miller, Campbell
        Vogler, McKee"]
        POS["🎯 posicionamento
        Ries, Neumeier
        Dunford, Keller, Sharp"]
        VIR["⚖️ virtudes
        Aristóteles
        Continuum"]
        VER["💬 universo-verbal
        West, Barthes
        Lakoff, Peirce"]
        VIS["🎨 universo-visual
        Brockmann, Vignelli
        Lupton, Hara"]
        SON["🎵 universo-sonoro
        Treasure, Groves
        Schafer, Chion"]
        MID["📱 mídias
        Wheeler, Neumeier
        McKinsey, Pine"]
    end

    PESQ --> ESCR
    ESCR --> REV
    REV --> VAL
    EXT -.->|informa| ESCR

    SB -.->|alimenta| ESCR
    POS -.->|alimenta| ESCR
    VIR -.->|alimenta| ESCR
    VER -.->|alimenta| ESCR
    VIS -.->|alimenta| ESCR
    SON -.->|alimenta| ESCR
    MID -.->|alimenta| ESCR

    style PIPELINE fill:#0d1117,stroke:#4a9eff,color:#fff
    style DOMAIN fill:#0d1117,stroke:#f0a500,color:#fff
```

---

## Mapa de Skills

```mermaid
graph TD
    subgraph PIPELINE_SKILLS["SKILLS DE PIPELINE"]
        PS["/pesquisar"]
        ES["/escrever"]
        RS["/revisar"]
        VS["/validar"]
        PP["/pipeline"]
    end

    subgraph DOMAIN_SKILLS["SKILLS DE DOMÍNIO"]
        SBS["/storybrand"]
        POSS["/posicionamento"]
        VIRS["/virtudes"]
        UVS["/universo-verbal"]
        ETS["/extrair-tom"]
        UVIS["/universo-visual"]
        USS["/universo-sonoro"]
        TPS["/touchpoints"]
    end

    PP -->|"sequencial"| PS --> ES --> RS --> VS

    SBS -->|"inclui pesquisa + escrita + revisão"| OUTPUT1["[PAGINA] Storybrand.md"]
    POSS --> OUTPUT2["[PAGINA] Posicionamento.md"]
    VIRS --> OUTPUT3["[PAGINA] Virtudes.md"]
    UVS --> OUTPUT4["[PAGINA] Territorio de Palavras.md
    [PAGINA] Glossario.md
    [PAGINA] Diretrizes de Uso.md"]
    ETS --> OUTPUT5["[EXTRACAO] DNA Verbal.md"]
    UVIS --> OUTPUT6["[PAGINA] Moodboard.md
    [PAGINA] Grafismos.md
    [PAGINA] Grid e Layout.md
    [PAGINA] Diretrizes Visuais.md"]
    USS --> OUTPUT7["[PAGINA] Universo Sonoro.md
    [PAGINA] Identidade Sonora.md"]
    TPS --> OUTPUT8["[PAGINA] Pontos de Contato.md"]

    style PIPELINE_SKILLS fill:#0d1117,stroke:#4a9eff,color:#fff
    style DOMAIN_SKILLS fill:#0d1117,stroke:#f0a500,color:#fff
```

---

## Mapa de Páginas × Skills × Agentes

```mermaid
graph LR
    subgraph BLOCO1["NÚCLEO ESTRATÉGICO"]
        P1["Posicionamento"]
        P2["Storybrand"]
        P3["Virtudes"]
    end

    subgraph BLOCO2["UNIVERSO VERBAL"]
        P4["Território de Palavras"]
        P5["Glossário"]
        P6["Diretrizes de Uso"]
    end

    subgraph BLOCO3["UNIVERSO VISUAL"]
        P7["Moodboard"]
        P8["Grafismos"]
        P9["Grid e Layout"]
        P10["Diretrizes Visuais"]
    end

    subgraph BLOCO4["UNIVERSO SONORO"]
        P11["Universo Sonoro"]
        P12["Identidade Sonora"]
    end

    subgraph BLOCO5["TOUCHPOINTS"]
        P13["Pontos de Contato"]
    end

    P1 --- S1["/posicionamento"] --- A1["especialista-posicionamento"]
    P2 --- S2["/storybrand"] --- A2["especialista-storybrand"]
    P3 --- S3["/virtudes"] --- A3["especialista-virtudes"]

    P4 --- S4["/universo-verbal"] --- A4["especialista-universo-verbal"]
    P5 --- S4
    P6 --- S4

    P7 --- S5["/universo-visual"] --- A5["especialista-universo-visual"]
    P8 --- S5
    P9 --- S5
    P10 --- S5

    P11 --- S6["/universo-sonoro"] --- A6["especialista-universo-sonoro"]
    P12 --- S6

    P13 --- S7["/touchpoints"] --- A7["especialista-midias"]

    style BLOCO1 fill:#0d1117,stroke:#e63946,color:#fff
    style BLOCO2 fill:#0d1117,stroke:#f0a500,color:#fff
    style BLOCO3 fill:#0d1117,stroke:#4a9eff,color:#fff
    style BLOCO4 fill:#0d1117,stroke:#52b788,color:#fff
    style BLOCO5 fill:#0d1117,stroke:#9b5de5,color:#fff
```

---

## Ordem de Execução Recomendada

```mermaid
gantt
    title Ordem de Produção das Páginas
    dateFormat X
    axisFormat %s

    section Núcleo Estratégico
    /extrair-tom (DNA Verbal)           :ext, 0, 1
    /posicionamento                      :pos, 1, 2
    /storybrand                          :sb, 2, 3
    /virtudes                            :vir, 3, 4

    section Universo Verbal
    /universo-verbal territorio          :ter, 4, 5
    /universo-verbal glossario           :glo, 5, 6
    /universo-verbal diretrizes          :dir, 6, 7

    section Universo Visual
    /universo-visual moodboard           :mood, 7, 8
    /universo-visual grid                :grid, 8, 9
    /universo-visual grafismos           :graf, 9, 10
    /universo-visual diretrizes          :dvis, 10, 11

    section Universo Sonoro
    /universo-sonoro visao               :son1, 11, 12
    /universo-sonoro identidade          :son2, 12, 13

    section Touchpoints
    /touchpoints                         :tp, 13, 14
```

**Lógica da ordem**:

1. **Extrair tom primeiro** — O DNA verbal real alimenta todas as outras páginas
2. **Posicionamento** — Ancora todo o restante (quem somos, para quem, por que diferentes)
3. **Storybrand** — Estrutura narrativa que alimenta conteúdo e comunicação
4. **Virtudes** — Sistema de comportamento que orienta decisões em todas as áreas
5. **Universo Verbal** — Base linguística para tudo que será escrito
6. **Universo Visual** — Sistema visual completo
7. **Universo Sonoro** — Dimensão sensorial complementar
8. **Touchpoints** — Aplicação de tudo nos canais reais (precisa de tudo anterior)

---

## Ciclo de Vida de uma Página

```mermaid
stateDiagram-v2
    [*] --> Pendente: Página identificada no TASKS

    Pendente --> Pesquisando: /pesquisar ou /skill-domínio
    Pesquisando --> Briefing_Pronto: [PESQUISA] criado

    Briefing_Pronto --> Escrevendo: Usuário aprova briefing
    Escrevendo --> Rascunho_Pronto: [PAGINA] criado

    Rascunho_Pronto --> Revisando: /revisar
    Revisando --> Aprovada_Revisao: P.R.I.S.M.A verde/amarelo
    Revisando --> Escrevendo: P.R.I.S.M.A vermelho

    Aprovada_Revisao --> Validando: /validar
    Validando --> Concluida: Score >= 90%
    Validando --> Escrevendo: Score < 75%
    Validando --> Corrigindo: Score 75-89%
    Corrigindo --> Validando: Ajustes aplicados

    Concluida --> [*]: TASKS atualizado ✅
```

---

## Arquivos Gerados por Página

Cada página produz até 4 arquivos no ciclo completo:

```
📁 branding/
├── [PESQUISA] Nome da Página.md    ← Briefing (Fase 1)
├── [PAGINA] Nome da Página.md      ← Página final (Fase 2)
├── [REVISAO] Nome da Página.md     ← Relatório de revisão (Fase 3)
└── [VALIDACAO] Nome da Página.md   ← Relatório de validação (Fase 4)
```

Arquivo especial (gerado uma vez, alimenta todas as páginas):
```
├── [EXTRACAO] DNA Verbal da Overlens.md   ← Output do /extrair-tom
```

---

## Frameworks Proprietários

### C.O.N.T.E.X.T.O (Pesquisa)

| Letra | Dimensão | Pergunta |
|-------|----------|----------|
| **C** | Conexões | Quais seções do doc central se conectam? |
| **O** | Objetivo | Qual o propósito desta página no Brand System? |
| **N** | Narrativa | Como se insere na narrativa maior? |
| **T** | Tom | Qual mix das 4 virtudes predomina? |
| **E** | Estrutura | Qual página similar serve de modelo? |
| **X** | Exemplos | Que dados/citações existentes incluir? |
| **T** | Território | Quais termos do vocabulário oficial usar? |
| **O** | Output | Formato e extensão esperados? |

### P.R.I.S.M.A (Revisão)

| Letra | Dimensão | Prioridade |
|-------|----------|------------|
| **P** | Propósito | 6 |
| **R** | Ritmo e Tom | 3 |
| **I** | Integridade Conceitual | 1 (máxima) |
| **S** | Sinergia com Ecossistema | 4 |
| **M** | Mecânica e Formato | 5 |
| **A** | Autenticidade | 2 |

### D.N.A Verbal (Extração de Tom)

| Letra | Dimensão | O que analisa |
|-------|----------|---------------|
| **D** | Dicionário Ativo | Palavras frequentes, expressões, padrões sintáticos, ausências |
| **N** | Narrativa e Ritmo | Comprimento de frases, estrutura, figuras de linguagem, cadência |
| **A** | Atitude e Postura | Registro, voz narrativa, intensidade, relação com leitor |

---

## Referências Teóricas por Domínio

```mermaid
mindmap
    root((Overlens Brand System))
        Storybrand
            Donald Miller — SB7
            Joseph Campbell — Monomito
            Christopher Vogler — Jornada do Escritor
            Robert McKee — Story
            Nancy Duarte — Resonate
            Jonah Sachs — Story Wars
        Posicionamento
            Al Ries & Jack Trout — Positioning
            Marty Neumeier — Zag / Brand Gap
            April Dunford — Obviously Awesome
            Michael Porter — Competitive Strategy
            Byron Sharp — How Brands Grow
            Kevin Keller — Strategic Brand Management
            David Aaker — Building Strong Brands
        Virtudes
            Aristóteles — Ética a Nicômaco
            Alasdair MacIntyre — After Virtue
            Philippa Foot — Virtues and Vices
            Comte-Sponville — Grandes Virtudes
        Universo Verbal
            Chris West — Verbal Identity
            Roland Barthes — Semiótica
            George Lakoff — Metaphors We Live By
            Charles Peirce — Semiótica
        Universo Visual
            Josef Müller-Brockmann — Grid Systems
            Massimo Vignelli — The Vignelli Canon
            Ellen Lupton — Thinking with Type
            Alina Wheeler — Brand Identity
            Kenya Hara — Designing Design
            Karl Gerstner — Designing Programmes
        Universo Sonoro
            Julian Treasure — Sound Business
            Walter Murch — In the Blink of an Eye
            John Groves — Commusication
            Murray Schafer — The Soundscape
            Michel Chion — Audio-Vision
        Touchpoints
            Alina Wheeler — Brand Identity
            Marty Neumeier — The Brand Flip
            McKinsey — Customer Decision Journey
            Pine & Gilmore — Experience Economy
```

---

## Como Usar na Prática

### Opção 1: Página por página (recomendado)
```
Usuário: /posicionamento
→ Especialista pesquisa + escreve + revisão automática
→ Usuário revisa e aprova
→ /validar Posicionamento
→ ✅ Concluída
```

### Opção 2: Pipeline genérico
```
Usuário: /pipeline Moodboard
→ Fase 1: Pesquisa (aguarda aprovação)
→ Fase 2: Escrita (aguarda aprovação)
→ Fase 3: Revisão (automática)
→ Fase 4: Validação (resultado final)
→ ✅ Concluída
```

### Opção 3: Fase por fase (controle total)
```
Usuário: /pesquisar Moodboard
(revisa briefing, ajusta se necessário)
Usuário: /escrever Moodboard
(revisa rascunho, ajusta se necessário)
Usuário: /revisar Moodboard
(analisa score P.R.I.S.M.A)
Usuário: /validar Moodboard
→ ✅ Concluída
```

### Antes de tudo: extrair o DNA
```
Usuário: /extrair-tom
→ Produz [EXTRACAO] DNA Verbal da Overlens.md
→ Alimenta TODAS as escritas seguintes
```

---

## Progresso

| # | Página | Bloco | Skill | Status |
|---|--------|-------|-------|--------|
| 1 | Posicionamento | Estratégico | `/posicionamento` | ✅ |
| 2 | Storybrand | Estratégico | `/storybrand` | ✅ |
| 3 | Virtudes | Estratégico | `/virtudes` | ✅ |
| 4 | Território de Palavras | Verbal | `/universo-verbal` | ✅ |
| 5 | Glossário | Verbal | `/universo-verbal` | ✅ |
| 6 | Diretrizes de Uso | Verbal | `/universo-verbal` | ✅ |
| 7 | Moodboard | Visual | `/universo-visual` | ✅ |
| 8 | Grafismos | Visual | `/universo-visual` | ✅ |
| 9 | Grid e Layout | Visual | `/universo-visual` | ✅ |
| 10 | Diretrizes Visuais | Visual | `/universo-visual` | ✅ |
| 11 | Universo Sonoro | Sonoro | `/universo-sonoro` | ✅ |
| 12 | Identidade Sonora | Sonoro | `/universo-sonoro` | ✅ |
| 13 | Pontos de Contato | Touchpoints | `/touchpoints` | ✅ |

**Legenda**: ⬜ Pendente · 🔄 Em andamento · ✅ Concluída
