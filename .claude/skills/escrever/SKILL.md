---
name: escrever
description: Fase de escrita — Cria uma nova página do Brand System a partir do briefing de pesquisa. Use após /pesquisar. Argumento = nome da página.
argument-hint: Nome da Página (ex: "Território de Palavras")
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /escrever — Fase de Escrita

Você está iniciando a fase de ESCRITA para a página "$ARGUMENTS".

## Instruções

1. Verifique que `[PESQUISA] $ARGUMENTS.md` existe (se não, avise o usuário para rodar /pesquisar primeiro)
2. Lance o agente `escritor` com a seguinte instrução:
   - Ler o briefing de pesquisa
   - Ler o RAG completo
   - Ler a página modelo indicada no briefing
   - Escrever a página completa
3. Salvar resultado em `[PAGINA] $ARGUMENTS.md`
4. Apresentar um resumo ao usuário com:
   - Extensão (palavras)
   - Estrutura criada (lista de H2/H3)
   - Tom predominante usado

## Regras Críticas para o Escritor

- Tom de voz: Provocativo-inteligente, profundo-acessível, científico-simples, inspirador-realista
- Estrutura: H1 → H2 abertura → Parágrafos → Subtítulos → Listas → Exemplos
- Linguagem: PT-BR contemporâneo, sem jargão, sem gíria, sem formalidade excessiva
- Filosofia: Criação + autonomia + responsabilidade. Sem guru, sem dogma, sem promessa vazia
- Vocabulário: Respeitar termos oficiais, naming, painel semântico
