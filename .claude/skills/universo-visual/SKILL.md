---
name: universo-visual
description: Constrói as 4 páginas do Universo Visual — Moodboard, Grafismos, Grid/Layout e Diretrizes Visuais. Usa Brockmann, Vignelli, Lupton, Wheeler.
argument-hint: "todas" ou nome específico ("moodboard", "grafismos", "grid", "diretrizes")
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /universo-visual — Construir o Universo Visual

Execute o pipeline para as páginas do Universo Visual:

Se "$ARGUMENTS" = "todas" ou vazio, produzir as 4 páginas em sequência.
Se especificado, produzir apenas a página indicada.

1. Lance o agente `especialista-universo-visual` com o RAG
2. Produzir:
   - `[PAGINA] Moodboard.md` — Sistema de referência visual em 5 eixos
   - `[PAGINA] Grafismos.md` — Elementos gráficos complementares (ruído, linhas, geometria, orgânico)
   - `[PAGINA] Grid e Layout.md` — Sistema de grid, espaçamento, hierarquia por formato
   - `[PAGINA] Diretrizes Visuais.md` — Usos corretos/incorretos, regras de aplicação
3. Rodar revisão com agente `revisor` para cada página
4. Apresentar resultado ao usuário

**Nota**: Descrever visualmente com PALAVRAS — o Brand System é texto, não Figma.
