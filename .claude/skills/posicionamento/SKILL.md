---
name: posicionamento
description: Constrói a página de Posicionamento da Overlens usando Al Ries, Neumeier, Dunford, Keller, Sharp e Porter.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /posicionamento — Construir o Posicionamento Estratégico

Execute o pipeline completo para a página de Posicionamento:

1. Lance o agente `especialista-posicionamento` para produzir a página
2. O agente deve ler `RAG_OVERLENS_COMPLETO.md` e as seções de público-chave e buyer personas
3. Aplicar: teste do "Only" (Neumeier), framework Dunford, POPs/PODs (Keller), distinctive assets (Sharp)
4. Incluir: mapa perceptual, território de marca, brand ladder
5. Salvar em `[PAGINA] Posicionamento.md`
6. Rodar revisão com agente `revisor`
7. Apresentar resultado ao usuário
