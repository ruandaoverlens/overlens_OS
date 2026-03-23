---
name: validar
description: Fase de validação final — Checklist binário de conformidade antes de considerar a página pronta. Última etapa do pipeline. Use após /revisar.
argument-hint: Nome da Página (ex: "Território de Palavras")
allowed-tools: Read, Write, Grep, Glob, Agent
---

# /validar — Fase de Validação

Você está iniciando a fase de VALIDAÇÃO FINAL para a página "$ARGUMENTS".

## Instruções

1. Verifique que `[PAGINA] $ARGUMENTS.md` existe e que `[REVISAO] $ARGUMENTS.md` foi aprovada
2. Lance o agente `validador` com a seguinte instrução:
   - Executar checklist completo de conformidade (estrutural, tom, vocabulário, filosófica, técnica, integração)
   - Buscar termos proibidos com Grep
   - Comparar extensão com páginas similares
   - Produzir relatório de validação
3. Salvar resultado em `[VALIDACAO] $ARGUMENTS.md`
4. Se APROVADA:
   - Atualizar `TASKS_PAGINAS_FALTANTES.md` marcando a página como `[x]` concluída
   - Informar o usuário que a página está pronta
5. Se REPROVADA:
   - Listar itens reprovados
   - Sugerir ação corretiva (voltar para /escrever ou /revisar)
6. Apresentar score final ao usuário

## Critérios de Aprovação
- ✅ APROVADA: Score >= 90% e ZERO itens críticos
- ⚠️ COM RESSALVAS: Score >= 75% e filosofia OK
- ❌ REPROVADA: Score < 75% OU filosofia reprovada
