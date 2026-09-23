---
name: universo-verbal
description: Constrói as 3 páginas do Universo Verbal, que são Território de Palavras, Glossário e Diretrizes de Uso. Usa semiótica, linguística de marca e o vocabulário já existente.
argument-hint: '"todas" ou nome específico ("territorio", "glossario", "diretrizes")'
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /universo-verbal: Construir o Universo Verbal

Execute o pipeline para as páginas do Universo Verbal:

Se "$ARGUMENTS" = "todas" ou vazio, produzir as 3 páginas em sequência.
Se especificado, produzir apenas a página indicada.

0. Leia `.claude/rules/tese-atual.md`, fonte normativa sobre público, categoria, vocabulário e produtos; prevalece sobre qualquer documento da base
1. Lance o agente `extrator-tom` PRIMEIRO para extrair o DNA verbal real da base canônica (`website/content/<sistema>/`; espelho sem frontmatter em `TRU/<sistema>/`), extraindo **forma**, não conteúdo legado
2. Salvar extração em `[EXTRACAO] DNA Verbal da Overlens.md`
3. Lance o agente `especialista-universo-verbal` com o DNA extraído + a base canônica + a regra normativa
4. Produzir:
   - `[PAGINA] Territorio de Palavras.md`: Campos semânticos, constelações de palavras
   - `[PAGINA] Glossario.md`: Todos os termos do ecossistema com definições
   - `[PAGINA] Diretrizes de Uso.md`: Regras práticas por canal com exemplos
5. Rodar revisão com agente `revisor` para cada página
6. Garantir que o glossário inclua **Atom** (identidade do membro da comunidade) e trate Nexialismo como capacidade, não como rótulo de público; termos substituídos ficam marcados como HISTÓRICO, não são apagados
7. Apresentar resultado ao usuário
