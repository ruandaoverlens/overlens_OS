# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repo hosts the **Overlens knowledge base**, a living set of documents covering the business, brand, growth, product and community of Overlens, **and** the Overlens platform code under `website/`.

**Overlens is an ecosystem of learning, business, creation and realization for people who want to turn ideas into reality.** Learning is a means; the goal is to create, build, experiment, validate, execute and realize. Education is one mechanism, AI is one infrastructure, projects are a core unit of learning, and community is part of the ecosystem.

> ⚠️ **The company is in transition.** Much of the knowledge base was written in late 2025 / early 2026 and describes an earlier version of Overlens. **Before writing or editing any knowledge-base document, read `.claude/rules/tese-atual.md`**. It is the normative source on audience, category, the role of AI and current vocabulary, and it overrides any conflicting document in the base. The per-document audit lives in `TRU/[AUDITORIA] Base de Conhecimento.md`.

When the user asks for "a new page", clarify which side they mean: a knowledge-base markdown document or a Next.js route under `website/src/app/`.

## Technical Infrastructure (platform side)

The Next.js app in `website/` powers the live Overlens product.

### Stack
- **Frontend/API**: Next.js 16 + React 19 (`website/`)
- **Backend**: Supabase (`supabase/` for migrations and config)
- **Hosting**: Vercel. `main` branch → production (`overlens-os.vercel.app`); any other branch → preview
- **Secrets**: [Infisical](https://infisical.com), project `overlens-os`, environments `dev` / `preview` / `production`. Synced to Vercel via Native Integration (auto-push on change). **No `.env.local` exists anywhere in the repo**, so running `npm run dev` requires `infisical login` first.
- **Cron jobs**: defined in `website/vercel.json` (currently `/api/magny/pipeline/watchdog` daily at 8am UTC).

### Where things live
- `website/src/`: app code, API routes, Magny pipeline (LLM agents)
- `website/scripts/`: standalone Node scripts (migrations, uploads). Run with `infisical run --env=dev -- npx tsx scripts/<name>.ts`
- `website/.infisical.json`: links the folder to the Infisical project (committed, no secrets)
- `supabase/`: DB migrations and config
- `assets/`, `_backup_*`: static assets and backups

### Local dev workflow
```bash
cd website
npm run dev   # wraps `next dev` with `infisical run --env=dev`; injects secrets in memory
```
Setup details (CLI install, login) are in `website/README.md`.

### Editing secrets
App web do Infisical → `overlens-os` → escolher o ambiente (`dev` / `preview` / `production`). Mudanças sincronizam para Vercel automaticamente em ~10s.

### Temas (claro e escuro)

A plataforma tem dois temas. `:root` em `website/src/app/globals.css` carrega o **claro**, `.dark` carrega o **escuro** (padrão do produto). O `next-themes` escreve a classe no `<html>`; o seletor fica na topbar de toda rota e na tela de login (`src/components/theme-toggle.tsx`).

Regras ao escrever qualquer cor:
- A escala `surface/*` é **relativa ao tema**: `surface-black` = o fundo, `surface-white` = contraste máximo, `surface-950/900/800` = superfícies, `surface-500/400/300/200` = texto. Funciona nos dois temas sem `dark:`.
- Preto e branco **literais** (amostra de paleta, véu sobre foto, fundo de preview de logo, "papel" de QR code) só via `--absolute-white` / `--absolute-black`, com comentário dizendo por quê. Nunca `bg-black` / `text-white`.
- `--brand-*` não inverte. Quando a cor de marca for **texto**, use `--brand-*-text`.
- Campo de formulário: `--input` é o **fundo** (`bg-input/30`), `--field-border` é o **limite** (3:1). Não use um no lugar do outro.
- Imagem de marca de cor chapada precisa do par `-light`/`-dark` trocado por CSS (`dark:hidden` / `hidden dark:block`), nunca por `useTheme()`.
- Ícones de `src/components/icons/` nascem `aria-hidden`; passe `aria-label` quando o ícone **for** o rótulo.
- `npm run check:contrast` precisa passar antes de mexer em token de cor. Decisão registrada em `docs/adr/0005-tema-claro-e-escala-de-superficie-relativa.md`.

### Architecture Decision Records (ADRs)
Decisões arquiteturais (plataforma, infraestrutura, processos) são registradas em `docs/adr/`, um arquivo por decisão, `NNNN-titulo-kebab.md`, em português, seguindo `docs/adr/template.md`. Regras: status `Proposto → Aceito → Substituído/Obsoleto`; ADRs aceitos não são editados no mérito (nova decisão = novo ADR que substitui o anterior); todo ADR novo entra no índice do `docs/adr/README.md`. Antes de implementar uma feature estrutural nova, verifique se existe ADR cobrindo a decisão. Se não existir, proponha um.

### Known gotchas
- Dev, preview, and production share the **same** Supabase project. Destructive queries in dev hit prod data.
- A few `process.env.X` references exist for unused features (`PERPLEXITY_API_KEY`, `FEEDLY_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `IMAGEN_MODEL`). They are **not** in Infisical: these code paths are dead. Don't add them to Infisical without confirming the feature is actually needed.

## Repository Structure (knowledge-base side)

### Canonical content location
- `website/content/<sistema>/...`: **canonical**, includes frontmatter (title, summary, topics, keywords, priority, ai_when_to_use, related). The site and the AI index read from here.
- `TRU/<sistema>/...`: same body, **no frontmatter**. Local fallback. **Always update both when editing.**

### Systems and their source of truth
| System | Is the truth about |
|--------|--------------------|
| `business_doc` | The business: model, revenue, offer architecture, bets, strategy |
| `brand_system` | Identity and meaning: positioning, narrative, language, worldbuilding, naming, symbols |
| `growth_system` | Market, audiences, acquisition and conversion: personas, ICP, segments, JTBD, Empathy Map, Value Proposition Canvas, funnels, channels, CRM, growth loops |
| `product_system` | Product: PBL, AI, projects, competencies, evidence, progress, roadmap |
| `community_system` | Community: members, levels, rituals, reputation, progression, roles, governance |
| `estudio_criativo` | Content System: creative studio, content method, playbooks, touchpoints |
| `pacote_cultural` | Cultural curation |

One topic, one owning document. Other documents reference; they never redefine.

### Governing rules
- `.claude/rules/tese-atual.md`: **normative**, covering current thesis, audience rule, vocabulary and certainty classification
- `.claude/rules/padrao-paginas.md`: page writing standard
- `.claude/rules/revisao-validacao.md`: review and validation frameworks
- `TRU/changes.md`: the directive behind the current repositioning
- `TRU/[AUDITORIA] Base de Conhecimento.md`: per-document audit status

### Pipeline Output Files
- `[PESQUISA] *.md`: Research briefings (output of /pesquisar)
- `[PAGINA] *.md`: Written pages (output of /escrever)
- `[REVISAO] *.md`: Review reports (output of /revisar)
- `[VALIDACAO] *.md`: Validation reports (output of /validar)

## Agent System

### Pipeline Agents (process)
| Agent | Role | Framework |
|-------|------|-----------|
| **pesquisador** | Extracts context, maps connections, finds references | C.O.N.T.E.X.T.O |
| **escritor** | Creates pages indistinguishable from existing ones | 4 Virtudes do Tom |
| **revisor** | Reviews for quality, consistency, authenticity | P.R.I.S.M.A |
| **validador** | Binary compliance checklist, final gate | 6-category checklist |
| **extrator-tom** | Analyzes real linguistic patterns from central doc | D.N.A Verbal |

### Domain Specialists (expertise)
| Agent | Domain | Key Frameworks |
|-------|--------|---------------|
| **especialista-storybrand** | Narrative & storytelling | Donald Miller SB7, Campbell, Vogler, McKee |
| **especialista-posicionamento** | Strategic positioning | Ries/Trout, Neumeier, Dunford, Keller, Sharp |
| **especialista-virtudes** | Brand virtues system | Aristotle (Nicomachean Ethics), continuum falta←virtude→excesso |
| **especialista-universo-verbal** | Verbal identity & glossary | Chris West, Barthes, Lakoff, semiotics |
| **especialista-universo-visual** | Visual system & direction | Brockmann, Vignelli, Lupton, Wheeler, Hara |
| **especialista-universo-sonoro** | Sonic branding & identity | Julian Treasure, Groves, Schafer, Chion |
| **especialista-midias** | Touchpoints & channels | Wheeler, Neumeier, McKinsey CDJ, Pine & Gilmore |

## Skills (Slash Commands)

### Pipeline Skills
| Command | Description |
|---------|-------------|
| `/pesquisar [página]` | Research phase: context gathering |
| `/escrever [página]` | Writing phase: page creation |
| `/revisar [página]` | Review phase: P.R.I.S.M.A evaluation |
| `/validar [página]` | Validation phase: compliance checklist |
| `/pipeline [página]` | All 4 phases sequentially |

### Domain Skills
| Command | Description |
|---------|-------------|
| `/storybrand` | Build narrative framework (SB7 + Hero's Journey) |
| `/posicionamento` | Build strategic positioning |
| `/virtudes` | Build virtue system (Aristotelian continuum) |
| `/universo-verbal [all/specific]` | Build Território + Glossário + Diretrizes de Uso |
| `/extrair-tom` | Extract real verbal DNA from central doc |
| `/universo-visual [all/specific]` | Build Moodboard + Grafismos + Grid + Diretrizes Visuais |
| `/universo-sonoro [all/specific]` | Build Universo Sonoro + Identidade Sonora |
| `/touchpoints` | Build Pontos de Contato map |

## Pipeline Flow

```
/pesquisar → [PESQUISA] → /escrever → [PAGINA] → /revisar → [REVISAO] → /validar → [VALIDACAO] → ✅ Done
```

Domain skills (`/storybrand`, `/posicionamento`, etc.) include built-in research + writing + review.

## Critical Rules for Writing New Pages

1. **Always read `.claude/rules/tese-atual.md` before writing.** It overrides any conflicting document in the base.
2. **Language**: Brazilian Portuguese. Accessible, no jargon, no slang, no excessive formality
3. **Tone** (4 virtues): Científica, Profunda, Provocativa, Inspiradora. Plus transversal: Adaptável
4. **Archetypes**: Mago (Prometheus, method) + Criador (form) + Sábio (ethics). Never guru, never dogmatic
5. **Structure**: H1 → H2 evocative opening → Paragraphs → Subtitles → Lists → Examples
6. **Guardrails**: No empty promises, no FOMO, no hustle porn, no messianism, no "acenda/forje/destrave"
7. **Audience rule (eliminatory)**: the audience is the **empreendedor**: whoever has an idea, ambition or vision and wants to turn it into reality. **State, not profession.** They may or may not be a designer, engineer, architect, artist, maker or researcher, and may come from any other origin. Never label the audience "designers", "criativos" or "profissionais criativos". Professions may appear as *examples of origin*, or inside the dynamic positioning construction ("a escola de negócios dos criadores / dos artistas / dos engenheiros / dos designers").
8. **Certainty classification**: mark strategic claims with the `dado` tag, placed at the **end** of the block it classifies, like a footnote, for example `... e quer transformá-la em realidade. <dado q="A" />`, where `q` runs from `A` to `E` (`A` definido, `B` em validação, `C` hipótese, `D` histórico, `E` pendente). Optional attributes: `nota` (a short qualifying sentence) and `fonte` (only when the document declares where the information came from; never invent one). The site renders each letter as a coloured dot with a tooltip, plus a second dot marked **F** when a source is declared. Never document exploration as a settled decision; when in doubt between `A` and `B`, use `B`.
9. **Never delete useful history**: move superseded positioning into a Histórico section, closing the block with `<dado q="D" />`.
10. **Edit both** `website/content/...` (with frontmatter) and `TRU/...` (body only)

## Key Brand Concepts

- **Brand thesis**: *O futuro não é um destino. O futuro é um projeto.*
- **Mission (em validação)**: ajudar pessoas a realizarem suas ideias
- **Purpose (histórico, still coherent)**: "colocar o poder da criação nas mãos das pessoas"
- **Positioning (em validação)**: "a escola de negócios dos criadores", a dynamic structure; repeating the categories is part of the concept
- **Atom**: the identity of a community member. Not student/subscriber/lead. The old meaning ("átomo" as a content unit) is obsolete.
- **Four modes** (behavioral and cognitive, **not** sequential maturity stages, **not** seniority): **Operante executa · Convergente conecta · Emergente cria · Nexialista orquestra**. "Inconscientes" is no longer used.
- **Nexialismo**: a capability Overlens develops, never a label for the audience
- **AI**: infrastructure, not category. Overlens does not compete with general models at answering, summarizing or generating.
- **Projects over content**: Projeto → necessidade → conhecimento → aplicação → evidência. PBL is a core structure.
- **Community**: infrastructure for learning and realization, not a retention feature
- **Delivery spectrum** (internal mental model): Aprender → Construir → Acelerar
- **3 Pillars**: Inspirar, Ensinar, Mover (a criar)
- **Visual identity**: Black base, micro-dose accents (ice blue, amber, moss green, burgundy), Inter + Outfit
- **Communication layers**: Provocar atenção (Ethos) → Validar credibilidade → Conexão emocional (Pathos) → Profundidade (Logos)
