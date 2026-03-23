---
name: universo-sonoro
description: Constrói as 2 páginas do Universo Sonoro — visão geral e identidade sonora. Usa Julian Treasure, sonic branding frameworks, semiótica sonora.
argument-hint: "todas" ou nome específico ("visao", "identidade")
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /universo-sonoro — Construir o Universo Sonoro

Execute o pipeline para as páginas do Universo Sonoro:

1. Lance o agente `especialista-universo-sonoro` com o RAG
2. Produzir:
   - `[PAGINA] Universo Sonoro.md` — Visão geral, semiótica, arquétipos sonoros
   - `[PAGINA] Identidade Sonora.md` — Sonic logo, brand music, soundscape, brand voice, silêncio, playlists
3. Rodar revisão com agente `revisor` para cada página
4. Apresentar resultado ao usuário
