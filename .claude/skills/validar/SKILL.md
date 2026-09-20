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
   - Ler `.claude/rules/tese-atual.md` — fonte normativa; prevalece sobre qualquer documento da base
   - Executar checklist completo de conformidade (estrutural, tom, vocabulário, filosófica, técnica, integração)
   - Verificar a regra de público, os quatro modos, IA como infraestrutura, as definições de Atlas/Overpass/Vanguarda e a classificação de certeza (DEFINIDO / EM VALIDAÇÃO / HIPÓTESE / HISTÓRICO / PENDENTE)
   - Buscar termos proibidos com Grep
   - Comparar extensão com páginas similares
   - Produzir relatório de validação
3. Salvar resultado em `[VALIDACAO] $ARGUMENTS.md`
4. Se APROVADA:
   - Confirmar que a página está sincronizada entre `website/content/<sistema>/` (com frontmatter) e `TRU/<sistema>/` (sem frontmatter)
   - Informar o usuário que a página está pronta
5. Se REPROVADA:
   - Listar itens reprovados
   - Sugerir ação corretiva (voltar para /escrever ou /revisar)
6. Apresentar score final ao usuário

## Critérios de Aprovação
- ✅ APROVADA: Score >= 90% e ZERO itens críticos
- ⚠️ COM RESSALVAS: Score >= 75% e filosofia OK
- ❌ REPROVADA: Score < 75% OU filosofia reprovada
