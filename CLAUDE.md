# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Overlens Brand System** — a living document repository containing the complete branding, strategy, identity, and communication guidelines for Overlens, a school that trains "Nexialist Designers" (creators who integrate design, philosophy, technology, and art).

This is **not a code repository**. It is a structured collection of Markdown documents that form the brand's operational system.

## Repository Structure

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
