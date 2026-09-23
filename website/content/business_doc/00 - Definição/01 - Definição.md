---
title: Definição
summary: "Apresenta o Business Document como a sobrecamada executiva do negócio da Overlens: o que ele responde, quais sistemas são fonte de verdade sobre cada assunto, a escala de classificação de certeza (DEFINIDO, EM VALIDAÇÃO, HIPÓTESE, HISTÓRICO, PENDENTE), as regras de evolução do documento e a estrutura das seis seções."
topics: [business document, definição, escopo, fontes de verdade, classificação de certeza, governança documental]
keywords: [Business Document, Brand System, Growth System, Product System, Community System, fontes de verdade, DEFINIDO, EM VALIDAÇÃO, HIPÓTESE, HISTÓRICO, PENDENTE, Mapa de Empatia, Value Proposition Canvas, ADR, criação de valor, captura de valor, documento interno]
priority: high
ai_when_to_use: |
  Use quando o usuário perguntar o que é o Business Document, qual o seu escopo, qual sistema é fonte de verdade sobre determinado assunto, como interpretar as marcações de certeza, por que Mapa de Empatia e Value Proposition Canvas não vivem aqui, ou quais são as regras para atualizar este documento.
related: ["business_doc/01 - Overview/01 - Executive Overview.md", "growth_system/00 - Definição/01 - Definição.md", "brand_system/01 - Definição/01 Definição.md", "product_system/00 - Definição/01 - Definição.md"]
---
# Definição

Documento interno · Acesso restrito · Em transição

## O Business Document é a sobrecamada de visão do negócio da Overlens. Ele existe para que qualquer pessoa ou agente compreenda, em um único lugar, como a companhia cria valor, como captura valor e onde pretende competir.

Este documento não concentra os detalhes de marca, produto, growth ou comunidade. Ele responde à pergunta executiva: **por que cada peça existe dentro do negócio**. O funcionamento de cada peça pertence ao sistema responsável por ela.

## O que este documento responde

- O que é a Overlens e por que existe.
- Como a empresa cria e captura valor.
- Quais negócios opera e como os produtos se relacionam.
- Como funciona o sistema econômico da companhia.
- Quais são as principais apostas e onde pretende competir.

## Fontes de verdade

A base de conhecimento da Overlens não deve ter definições concorrentes. Cada assunto tem um documento responsável; os demais referenciam, não redefinem.

| Sistema | É verdade sobre |
| :---- | :---- |
| **Business Document** | O negócio: modelo, receita, arquitetura de ofertas, apostas, estratégia. |
| **Brand System** | Identidade e significado: posicionamento, narrativa, linguagem, worldbuilding, nomenclaturas. |
| **Growth System** | Mercado, públicos, aquisição e conversão: personas, ICP, segmentos, JTBD, mapa de empatia, Value Proposition Canvas, funis, canais, CRM, growth loops. |
| **Product System** | O produto: como a visão vira experiência, PBL, IA, projetos, competências, roadmap. *(ainda não existe)* |
| **Community System** | O funcionamento da comunidade: membros, rituais, reputação, progressão, governança. *(ainda não existe)* |

Dois artefatos que poderiam ser esperados aqui **não pertencem a este documento**: o **Mapa de Empatia** e o **Value Proposition Canvas** vivem no Growth System, porque existem na relação entre um segmento específico de cliente e uma proposta específica de valor. Este documento carrega apenas um resumo executivo e o ponteiro.

## Classificação de certeza

A Overlens está em transição. Documentar exploração estratégica como decisão tomada é o erro mais caro que esta base pode cometer. Por isso cada afirmação relevante carrega uma marcação:

| Bolinha | Significa | Quando usar |
| :---- | :---- | :---- |
| **A** | DEFINIDO | Decisão tomada e atualmente válida |
| **B** | EM VALIDAÇÃO | Direção em teste, com evidência parcial |
| **C** | HIPÓTESE | Possibilidade ainda não validada |
| **D** | HISTÓRICO | Já foi verdadeiro; não representa a direção atual |
| **E** | PENDENTE | Precisa existir e ainda não existe |

No site, cada letra aparece como um ponto colorido com tooltip, e um segundo ponto marcado **F** indica que a afirmação tem fonte declarada.

Uma informação sem marcação deve ser lida como ainda não classificada, não como confirmada.

## Princípio de consistência

Documentos mais recentes relacionados ao novo posicionamento prevalecem sobre documentos antigos quando houver conflito. A presença de uma informação na base não é prova de que ela esteja correta. A data e o contexto estratégico contam.

Grande parte da base de conhecimento da Overlens foi construída no fim de 2025 e início de 2026 e descreve uma versão anterior da empresa. O estado dessa revisão está registrado no relatório de auditoria da base de conhecimento.

## Como este documento evolui

- Nenhum número entra sem origem declarada e data.
- Nenhuma seção marcada como PENDENTE é preenchida com estimativa.
- Aposta não vira decisão por repetição; vira decisão por validação registrada.
- Informação histórica não é apagada: é movida para a seção **Histórico** e marcada como tal.
- Decisões estruturais de negócio também geram um ADR em `docs/adr/`.

## Estrutura

| Seção | Conteúdo |
| :---- | :---- |
| **Overview** | Executive Overview, Visão, Missão e Business Thesis. |
| **Modelos** | Business Model Canvas, Lean Canvas e o ponteiro do Value Proposition Canvas. |
| **Arquitetura** | Produtos e serviços, receita, jornada macro e flywheel. |
| **Estratégia** | Moats, apostas estratégicas, princípios de negócio e riscos. |
| **Pesquisa** | Research & Market Intelligence. |
| **Histórico** | Evolução da empresa e registro do modelo anterior. |
