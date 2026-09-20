---
name: extrair-tom
description: Extrai o DNA verbal real da Overlens analisando a base canônica. Produz mapa de padrões linguísticos, ritmo, vocabulário ativo e guia de replicação. Use antes de escrever páginas críticas.
allowed-tools: Read, Grep, Glob, Write, Bash, Agent
---

# /extrair-tom — Extrair DNA Verbal

Execute a extração completa do tom de voz real:

1. Lance o agente `extrator-tom`
2. O agente deve analisar a base canônica (`website/content/<sistema>/`; espelho sem frontmatter em `TRU/<sistema>/`) usando o framework D.N.A Verbal, extraindo **forma** e sinalizando conteúdo anterior à tese atual (`.claude/rules/tese-atual.md`, que prevalece sobre a base) como legado a não replicar:
   - **D**icionário Ativo: palavras frequentes, expressões recorrentes, padrões sintáticos
   - **N**arrativa e Ritmo: comprimento de frases, estrutura de seções, figuras de linguagem
   - **A**titude e Postura: registro, voz narrativa, intensidade emocional
3. Salvar em `[EXTRACAO] DNA Verbal da Overlens.md`
4. Apresentar resumo com:
   - Top 20 palavras mais significativas
   - 5 padrões sintáticos recorrentes
   - Perfil de registro (formal↔informal, assertivo↔tentativo)
   - 10 regras práticas de replicação
   - Lista de padrões que carregam conteúdo legado (público como "designers"/"Empreendedores Nexialistas", cinco perfis antigos, "Inconscientes", IA como categoria) e não devem ser replicados
