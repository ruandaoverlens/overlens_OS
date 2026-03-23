---
name: universo-verbal
description: Constrói as 3 páginas do Universo Verbal — Território de Palavras, Glossário e Diretrizes de Uso. Usa semiótica, linguística de marca e o vocabulário já existente.
argument-hint: "todas" ou nome específico ("territorio", "glossario", "diretrizes")
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /universo-verbal — Construir o Universo Verbal

Execute o pipeline para as páginas do Universo Verbal:

Se "$ARGUMENTS" = "todas" ou vazio, produzir as 3 páginas em sequência.
Se especificado, produzir apenas a página indicada.

1. Lance o agente `extrator-tom` PRIMEIRO para extrair o DNA verbal real do documento central
2. Salvar extração em `[EXTRACAO] DNA Verbal da Overlens.md`
3. Lance o agente `especialista-universo-verbal` com o DNA extraído + RAG
4. Produzir:
   - `[PAGINA] Territorio de Palavras.md` — Campos semânticos, constelações de palavras
   - `[PAGINA] Glossario.md` — Todos os termos do ecossistema com definições
   - `[PAGINA] Diretrizes de Uso.md` — Regras práticas por canal com exemplos
5. Rodar revisão com agente `revisor` para cada página
6. Apresentar resultado ao usuário
