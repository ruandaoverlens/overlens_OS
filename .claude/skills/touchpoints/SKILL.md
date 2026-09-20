---
name: touchpoints
description: Constrói a página de Pontos de Contato mapeando todos os touchpoints da Overlens por jornada do Empreendedor Nexialista, com diretrizes por canal.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /touchpoints — Construir Pontos de Contato

Execute o pipeline para a página de Pontos de Contato:

1. Lance o agente `especialista-midias` com o RAG + diretrizes de Instagram existentes
2. Produzir `[PAGINA] Pontos de Contato.md` com:
   - Mapa de touchpoints por jornada (Descoberta → Consideração → Entrada → Profundidade → Legado)
   - Diretrizes por canal (Instagram, YouTube, plataforma, e-mail, eventos, DM)
   - Tom predominante e persona sintética ativa para cada touchpoint
   - Métricas de sucesso por canal
3. Rodar revisão com agente `revisor`

**Lembrete**: o público é o Empreendedor Nexialista — nunca "designers" ou "criativos". As 5 jornadas seguem os 5 perfis eixados pela distância entre ideia e realidade (Inconsciente → Operante → Convergente → Emergente → Nexialista). Nenhum touchpoint pode usar FOMO, escassez falsa ou promessa de faturamento.
4. Apresentar resultado ao usuário
