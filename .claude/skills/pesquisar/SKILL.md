---
name: pesquisar
description: Fase de pesquisa — Investiga o documento central e reúne todo o contexto necessário antes de escrever uma nova página do Brand System. Use com o nome da página como argumento.
argument-hint: Nome da Página (ex: "Território de Palavras")
allowed-tools: Read, Grep, Glob, Bash, WebSearch, WebFetch, Agent
---

# /pesquisar — Fase de Pesquisa

Você está iniciando a fase de PESQUISA para a página "$ARGUMENTS".

## Instruções

1. Lance o agente `pesquisador` para investigar tudo sobre esta página
2. O agente deve:
   - Ler `RAG_OVERLENS_COMPLETO.md` para contexto geral
   - Buscar no documento central as seções conectadas
   - Identificar a página mais similar já escrita (para usar como modelo de tom/estrutura)
   - Pesquisar frameworks de branding relevantes (Neumeier, Aaker, Wheeler, Olins)
   - Produzir o briefing no formato C.O.N.T.E.X.T.O
3. Salvar resultado em `[PESQUISA] $ARGUMENTS.md`
4. Apresentar um resumo ao usuário

## Contexto do Projeto

Este é o Brand System da Overlens — uma escola de criadores nexialistas. O documento central tem ~3079 linhas com páginas completas e páginas vazias. Estamos completando as páginas vazias. Cada nova página deve ser INDISTINGUÍVEL das já escritas.

## Checklist do TASKS

Após concluir, atualize o status da página no `TASKS_PAGINAS_FALTANTES.md` para `[~]` (em andamento).
