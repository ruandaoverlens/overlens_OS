---
name: storybrand
description: Constrói a página Storybrand/Roteiro da Overlens usando SB7 (Donald Miller), Jornada do Herói (Campbell) e os elementos narrativos já existentes no Brand System.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /storybrand — Construir o Roteiro Narrativo

Execute o pipeline completo para a página Storybrand/Roteiro:

1. Lance o agente `especialista-storybrand` para produzir a página
2. O agente deve ler `RAG_OVERLENS_COMPLETO.md` e as seções narrativas do documento central (Manifesto, Tomorrowland, Linha do Tempo)
3. Aplicar SB7 Framework + Jornada do Herói adaptados ao contexto Overlens
4. Integrar os elementos já mencionados no documento central (linha 1168-1172): fissuras sociais, desgastes, cultura, emoções primitivas
5. Salvar em `[PAGINA] Storybrand.md`
6. Rodar revisão com agente `revisor` (P.R.I.S.M.A)
7. Apresentar resultado ao usuário

**Lembrete**: O herói é o CRIADOR, não a Overlens. A Overlens é o GUIA.
