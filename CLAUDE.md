# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Overlens Brand System** — a living document repository containing the complete branding, strategy, identity, and communication guidelines for Overlens, a school that trains "Nexialist Designers" (creators who integrate design, philosophy, technology, and art).

The repo is **dual-purpose**: it hosts the Brand System (Markdown documents — the original and primary focus) **and** the Overlens platform code under `website/`. When the user asks for "a new page", clarify which side they mean — Brand System markdown (e.g., `[PAGINA] Nome.md`) or a Next.js route under `website/src/app/`.

## Technical Infrastructure (platform side)

The Next.js app in `website/` powers the live Overlens product.

### Stack
- **Frontend/API**: Next.js 16 + React 19 (`website/`)
- **Backend**: Supabase (`supabase/` for migrations and config)
- **Hosting**: Vercel — `main` branch → production (`overlens-os.vercel.app`); any other branch → preview
- **Secrets**: [Infisical](https://infisical.com) — project `overlens-os`, environments `dev` / `preview` / `production`. Synced to Vercel via Native Integration (auto-push on change). **No `.env.local` exists anywhere in the repo** — running `npm run dev` requires `infisical login` first.
- **Cron jobs**: defined in `website/vercel.json` (currently `/api/magny/pipeline/watchdog` daily at 8am UTC).

### Where things live
- `website/src/` — app code, API routes, Magny pipeline (LLM agents)
- `website/scripts/` — standalone Node scripts (migrations, uploads). Run with `infisical run --env=dev -- npx tsx scripts/<name>.ts`
- `website/.infisical.json` — links the folder to the Infisical project (committed, no secrets)
- `supabase/` — DB migrations and config
- `assets/`, `_backup_*` — static assets and backups

### Local dev workflow
```bash
cd website
npm run dev   # wraps `next dev` with `infisical run --env=dev` — injects secrets in memory
```
Setup details (CLI install, login) are in `website/README.md`.

### Editing secrets
App web do Infisical → `overlens-os` → escolher o ambiente (`dev` / `preview` / `production`). Mudanças sincronizam para Vercel automaticamente em ~10s.

### Known gotchas
- Dev, preview, and production share the **same** Supabase project. Destructive queries in dev hit prod data.
- A few `process.env.X` references exist for unused features (`PERPLEXITY_API_KEY`, `FEEDLY_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, `IMAGEN_MODEL`). They are **not** in Infisical — these code paths are dead. Don't add them to Infisical without confirming the feature is actually needed.

## Repository Structure (Brand System side)

### Core Documents
- `[B] O Livro de Branding da Overlens (1).md` — The **central document** (~3079 lines). Single source of truth.
- `RAG_OVERLENS_COMPLETO.md` — Comprehensive context extraction. **Read this first** before any work.
- `TASKS_PAGINAS_FALTANTES.md` — Checklist of 13 pages to complete, organized by priority.

### Pipeline Output Files
- `[PESQUISA] *.md` — Research briefings (output of /pesquisar)
- `[PAGINA] *.md` — Written pages (output of /escrever)
- `[REVISAO] *.md` — Review reports (output of /revisar)
- `[VALIDACAO] *.md` — Validation reports (output of /validar)

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
| `/pesquisar [página]` | Research phase — context gathering |
| `/escrever [página]` | Writing phase — page creation |
| `/revisar [página]` | Review phase — P.R.I.S.M.A evaluation |
| `/validar [página]` | Validation phase — compliance checklist |
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

1. **Always read `RAG_OVERLENS_COMPLETO.md` before writing**
2. **Language**: Brazilian Portuguese. Accessible, no jargon, no slang, no excessive formality
3. **Tone** (4 virtues): Científica, Profunda, Provocativa, Inspiradora. Plus transversal: Adaptável
4. **Archetypes**: Mago (Prometheus, method) + Criador (form) + Sábio (ethics). Never guru, never dogmatic
5. **Structure**: H1 → H2 evocative opening → Paragraphs → Subtitles → Lists → Examples
6. **Guardrails**: No empty promises, no FOMO, no hustle porn, no messianism, no "acenda/forje/destrave"
7. **Vocabulary**: Respect official terms (Nexialista, Lente, Sistema Vivo, Capital Simbólico)
8. **File naming**: `[PAGINA] Nome da Página.md`

## Key Brand Concepts

- **Purpose**: "Colocar o poder da criação nas mãos das pessoas"
- **3 Pillars**: Inspirar, Ensinar, Mover (a criar)
- **5 Maturity Profiles**: Inconscientes → Operantes → Convergentes → Emergentes → Nexialistas
- **Visual identity**: Black base, micro-dose accents (ice blue, amber, moss green, burgundy), Inter + Outfit
- **Communication layers**: Provocar atenção (Ethos) → Validar credibilidade → Conexão emocional (Pathos) → Profundidade (Logos)
