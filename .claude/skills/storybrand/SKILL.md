---
name: storybrand
description: Constrói a página Storybrand/Roteiro da Overlens usando SB7 (Donald Miller), Jornada do Herói (Campbell) e os elementos narrativos já existentes no Brand System.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /storybrand — Construir o Roteiro Narrativo

Execute o pipeline completo para a página Storybrand/Roteiro:

1. Lance o agente `especialista-storybrand` para produzir a página
2. O agente deve ler `.claude/rules/tese-atual.md` (normativa, prevalece sobre a base) e as seções narrativas da base canônica em `website/content/<sistema>/` (Manifesto, Tomorrowland, Linha do Tempo); o espelho sem frontmatter fica em `TRU/<sistema>/`
3. Aplicar SB7 Framework + Jornada do Herói adaptados ao contexto Overlens
4. Integrar os elementos narrativos já mencionados na base: fissuras sociais, desgastes, cultura, emoções primitivas
5. Salvar em `[PAGINA] Storybrand.md`
6. Rodar revisão com agente `revisor` (P.R.I.S.M.A)
7. Apresentar resultado ao usuário

**Lembrete**: O herói é o EMPREENDEDOR — quem tem uma ideia, ambição ou visão de futuro e quer transformá-la em realidade. A Overlens é o GUIA.
O herói **define-se pelo estado, não pela profissão**: pode ou não ser designer, engenheiro, arquiteto, artista, inventor, maker ou pesquisador, e pode vir de qualquer outra origem. Nunca é rotulado como "designer", "criativo" nem como "Empreendedor Nexialista" (Nexialismo é capacidade, não nome do público).
Os quatro modos (Operante executa · Convergente conecta · Emergente cria · Nexialista orquestra) NÃO são o arco da jornada — são formas de agir e pensar. Não existe perfil "Inconsciente".
IA é infraestrutura, não categoria. Não inventar personas: as antigas estão desatualizadas; marcar material dependente delas como "necessita revisão de persona".
Cuidado com hustle porn: o arco narrativo termina em autoria e sustentação, nunca em faturamento, enriquecimento ou "liberdade financeira".
