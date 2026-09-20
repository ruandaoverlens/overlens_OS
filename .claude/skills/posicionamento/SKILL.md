---
name: posicionamento
description: Constrói a página de Posicionamento da Overlens usando Al Ries, Neumeier, Dunford, Keller, Sharp e Porter.
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, Agent
---

# /posicionamento — Construir o Posicionamento Estratégico

Execute o pipeline completo para a página de Posicionamento:

1. Lance o agente `especialista-posicionamento` para produzir a página
2. O agente deve ler `.claude/rules/tese-atual.md` (normativa, prevalece sobre a base) e as seções de público na base canônica (`website/content/<sistema>/`; espelho em `TRU/<sistema>/`)
   - **Público**: o **empreendedor** — quem tem uma ideia, ambição ou visão de futuro e quer transformá-la em realidade; define-se pelo estado, não pela profissão. O conjunto competitivo é o de escolas de negócio, comunidades de fundadores e aceleradoras. Nunca rotular o público como "designers", "criativos" nem como "Empreendedor Nexialista" — profissões só como exemplos de origem ou dentro da estrutura dinâmica de posicionamento
   - **Expressão em exploração (EM VALIDAÇÃO)**: "A escola de negócios dos criadores" — estrutura dinâmica (dos artistas · dos engenheiros · dos inventores · dos designers · dos sonhadores)
   - **IA é infraestrutura, não categoria**: sem "escola de IA" nem "formação para a era da IA"
   - **Não inventar personas nem pesquisa de mercado**: TAM/SAM/SOM e concorrência seguem PENDENTES
3. Aplicar: teste do "Only" (Neumeier), framework Dunford, POPs/PODs (Keller), distinctive assets (Sharp)
4. Incluir: mapa perceptual, território de marca, brand ladder
   - Classificar cada afirmação: DEFINIDO / EM VALIDAÇÃO / HIPÓTESE / HISTÓRICO / PENDENTE. Posicionamentos anteriores vão para seção de Histórico, marcados como HISTÓRICO
5. Salvar em `[PAGINA] Posicionamento.md`
6. Rodar revisão com agente `revisor`
7. Apresentar resultado ao usuário
