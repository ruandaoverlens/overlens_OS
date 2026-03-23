---
name: virtudes
description: Constrói a página de Virtudes da Overlens usando o continuum aristotélico (Ética a Nicômaco), conectando com tom de voz, princípios e guardrails éticos existentes.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /virtudes — Construir o Sistema de Virtudes

Execute o pipeline completo para a página de Virtudes:

1. Lance o agente `especialista-virtudes` para produzir a página
2. O agente deve ler `RAG_OVERLENS_COMPLETO.md`, seções de Tom de Voz, Princípios e Cuidados/Riscos
3. Aplicar continuum aristotélico (falta ← virtude → excesso) para cada virtude
4. Expandir além do tom de voz: virtudes de comportamento e decisão
5. Conectar guardrails éticos como manifestação do continuum
6. Incluir phronesis como meta-virtude
7. Salvar em `[PAGINA] Virtudes.md`
8. Rodar revisão com agente `revisor`
9. Apresentar resultado ao usuário
