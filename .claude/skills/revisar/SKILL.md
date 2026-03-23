---
name: revisar
description: Fase de revisão — Revisa uma página escrita usando o framework P.R.I.S.M.A. Verifica tom, integridade, sinergia e autenticidade. Use após /escrever.
argument-hint: Nome da Página (ex: "Território de Palavras")
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
---

# /revisar — Fase de Revisão

Você está iniciando a fase de REVISÃO para a página "$ARGUMENTS".

## Instruções

1. Verifique que `[PAGINA] $ARGUMENTS.md` existe (se não, avise o usuário para rodar /escrever primeiro)
2. Lance o agente `revisor` com a seguinte instrução:
   - Ler a página escrita
   - Ler o RAG completo para contexto
   - Ler pelo menos 2 páginas similares do documento central para comparação
   - Aplicar o framework P.R.I.S.M.A (Propósito, Ritmo, Integridade, Sinergia, Mecânica, Autenticidade)
   - Produzir relatório de revisão
3. Salvar resultado em `[REVISAO] $ARGUMENTS.md`
4. Se o veredicto for "Aprovada com ajustes":
   - Aplicar os ajustes automaticamente na página
   - Salvar versão corrigida
5. Se o veredicto for "Reescrever":
   - Avisar o usuário e sugerir rodar /escrever novamente
6. Apresentar o score P.R.I.S.M.A ao usuário
