---
name: pesquisar
description: Fase de pesquisa. Investiga a base canônica e reúne todo o contexto necessário antes de escrever uma nova página do Brand System. Use com o nome da página como argumento.
argument-hint: "Nome da Página (ex: \"Território de Palavras\")"
allowed-tools: Read, Grep, Glob, Bash, WebSearch, WebFetch, Agent
---

# /pesquisar: Fase de Pesquisa

Você está iniciando a fase de PESQUISA para a página "$ARGUMENTS".

## Instruções

1. Lance o agente `pesquisador` para investigar tudo sobre esta página
2. O agente deve:
   - Ler `.claude/rules/tese-atual.md`, fonte normativa que prevalece sobre qualquer documento da base
   - Buscar na base canônica (`website/content/<sistema>/`, com frontmatter; espelho sem frontmatter em `TRU/<sistema>/`) as seções conectadas. Fontes de verdade por sistema: `.claude/rules/tese-atual.md` §10
   - Identificar a página mais similar já escrita (para usar como modelo de tom/estrutura)
   - Pesquisar frameworks de branding relevantes (Neumeier, Aaker, Wheeler, Olins)
   - Produzir o briefing no formato C.O.N.T.E.X.T.O, classificando a certeza do que reportar (DEFINIDO / EM VALIDAÇÃO / HIPÓTESE / HISTÓRICO / PENDENTE) e sinalizando material legado da tese anterior
3. Salvar resultado em `[PESQUISA] $ARGUMENTS.md`
4. Apresentar um resumo ao usuário

## Contexto do Projeto

Este é o Brand System da Overlens, uma escola de negócios, criação e realização para **empreendedores**: quem tem uma ideia, ambição ou visão de futuro e quer transformá-la em realidade. O público **define-se pelo estado, não pela profissão**, e NUNCA é rotulado como "designers", "criativos" nem como "Empreendedor Nexialista". Estamos completando páginas faltantes na base canônica. Cada nova página deve ser INDISTINGUÍVEL das já escritas **em tom**, mas boa parte da base foi escrita antes da tese atual, então não replique conteúdo legado.

## Regra Normativa

`.claude/rules/tese-atual.md` prevalece sobre qualquer documento da base. A presença de uma afirmação na base não é prova de que ela esteja correta.
