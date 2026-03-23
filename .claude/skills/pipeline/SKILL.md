---
name: pipeline
description: Pipeline completo — Executa todas as 4 fases (pesquisar → escrever → revisar → validar) para uma página de uma vez. Use quando quiser automatizar o processo inteiro.
argument-hint: Nome da Página (ex: "Território de Palavras")
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent
---

# /pipeline — Pipeline Completo de Criação de Página

Você está executando o PIPELINE COMPLETO para a página "$ARGUMENTS".

## Fluxo

Execute as 4 fases em sequência:

### Fase 1: PESQUISA
- Lance o agente `pesquisador`
- Produza `[PESQUISA] $ARGUMENTS.md`
- Apresente resumo do briefing ao usuário
- AGUARDE aprovação do usuário antes de continuar

### Fase 2: ESCRITA
- Lance o agente `escritor` com o briefing aprovado
- Produza `[PAGINA] $ARGUMENTS.md`
- Apresente estrutura e resumo ao usuário
- AGUARDE aprovação do usuário antes de continuar

### Fase 3: REVISÃO
- Lance o agente `revisor`
- Produza `[REVISAO] $ARGUMENTS.md`
- Se "Aprovada com ajustes": aplique ajustes automaticamente
- Se "Reescrever": volte à Fase 2
- Apresente score P.R.I.S.M.A ao usuário
- AGUARDE aprovação do usuário antes de continuar

### Fase 4: VALIDAÇÃO
- Lance o agente `validador`
- Produza `[VALIDACAO] $ARGUMENTS.md`
- Se APROVADA: marque como concluída no TASKS
- Se REPROVADA: volte à fase necessária
- Apresente resultado final

## Regras do Pipeline

1. SEMPRE aguardar aprovação do usuário entre fases
2. Se qualquer fase falhar, não continuar automaticamente
3. Manter o usuário informado do progresso
4. Ao final, apresentar resumo completo:
   - Página criada (extensão, estrutura)
   - Score P.R.I.S.M.A da revisão
   - Score de validação
   - Status no TASKS

## Contexto

Referência obrigatória: `RAG_OVERLENS_COMPLETO.md`
Checklist: `TASKS_PAGINAS_FALTANTES.md`
Documento central: `[B] O Livro de Branding da Overlens (1).md`
