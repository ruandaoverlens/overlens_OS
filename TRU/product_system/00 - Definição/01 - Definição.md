# Definição

Documento interno · Acesso restrito · Sistema novo, majoritariamente em construção

## O Product System descreve como a visão da Overlens vira produto. Ele não justifica o produto — apenas explica o funcionamento dele.

A separação é simples e vale para toda a base. O **Business Document** responde *por que esse produto existe dentro do negócio*: como a companhia cria valor, como captura valor, quais apostas assume e onde pretende competir. O **Product System** responde *como esse produto funciona*: qual é a unidade central da experiência, como aprendizagem vira capacidade, o que conta como evidência, qual é o papel da IA e o que a plataforma faz hoje.

Quando as duas respostas divergirem, não é um problema de redação: é sinal de que uma decisão de negócio ainda não chegou ao produto, ou de que o produto avançou numa direção que o negócio não registrou.

## O que este sistema responde

- Qual é a unidade central da experiência e por quê.
- Como aprendizagem, projeto e execução se conectam.
- O que a Overlens precisa conseguir observar sobre cada pessoa.
- O que conta como evidência de capacidade.
- Qual é a função da IA dentro do produto — e qual não é.
- O que a plataforma própria faz hoje, o que custa e o que provaria a decisão.
- O que ainda precisa ser decidido antes de existir roadmap.

## O que este sistema não responde

Este documento referencia; não redefine. **DEFINIDO** por `.claude/rules/tese-atual.md` §10:

| Assunto | Sistema responsável |
| :---- | :---- |
| O que cada oferta é (Atlas, Overpass, Vanguarda, serviços) | Business Document |
| Modelo de receita, apostas e estratégia | Business Document |
| Posicionamento, narrativa, linguagem, Atom como conceito | Brand System |
| Personas, ICP, segmentos, JTBD, funis, canais, CRM | Growth System |
| Membros, níveis, rituais, reputação, papéis, governança | Community System |

Uma consequência prática: **Overpass aparece aqui como ambiente onde o produto acontece, não como oferta comercial.** A definição da oferta está em `Business Document › Arquitetura de Produtos e Serviços`. A implementação operacional de ser um Atom pertence ao Community System; a definição conceitual de Atom pertence ao Brand System.

## Classificação de certeza — obrigatória

A Overlens está em transição, e documentar exploração estratégica como decisão tomada é o erro mais caro que esta base pode cometer. Toda afirmação relevante deste sistema carrega uma marcação:

| Marcação | Significado |
| :---- | :---- |
| **DEFINIDO** | Decisão tomada e atualmente válida. |
| **EM VALIDAÇÃO** | Direção em teste, com evidência parcial. |
| **HIPÓTESE** | Possibilidade ainda não validada. |
| **HISTÓRICO** | Já foi verdadeiro; não representa a direção atual. |
| **PENDENTE** | Precisa existir e ainda não existe — não preencher com suposição. |

Na dúvida entre DEFINIDO e EM VALIDAÇÃO, escolher **EM VALIDAÇÃO**. Uma informação sem marcação deve ser lida como ainda não classificada, nunca como confirmada.

## O estado honesto deste sistema

Vale dizer isto antes de qualquer leitura: **este sistema é novo e quase tudo nele é HIPÓTESE ou PENDENTE.**

O que está razoavelmente firme é a direção: projeto como unidade central, PBL como estrutura de ligação, IA como infraestrutura e não como categoria, evidência como resultado esperado. O que não existe é a implementação. Não há grafo de capacidades. Não há roadmap. Não há métrica de produto instrumentada. A plataforma que existe hoje serve principalmente à operação interna da companhia, não à experiência de aprendizagem descrita aqui.

Isso não invalida o sistema — define para que ele serve agora. Ele é o lugar onde a ambição de produto fica escrita de forma verificável, para que a distância entre o que se pretende e o que existe permaneça visível em vez de ser confundida com progresso.

## Estrutura

| Seção | Conteúdo |
| :---- | :---- |
| **Fundamentos** | Princípios de produto, projeto como unidade central e PBL. |
| **Sistema** | Grafo de capacidades, evidências e progresso, IA no produto. |
| **Plataforma** | Overlens OS: o que existe, o que custa e o que provaria a decisão. |
| **Roadmap** | Roadmap e métricas de produto — estrutura criada, conteúdo pendente. |

## Como este sistema evolui

- Nenhuma funcionalidade entra aqui antes de existir ou de ser uma decisão registrada.
- Nenhuma seção marcada como PENDENTE é preenchida com estimativa.
- Hipótese não vira decisão por repetição; vira decisão por validação registrada, com data.
- Decisões estruturais de produto também geram um ADR em `docs/adr/`.
- Informação histórica não é apagada: é movida para uma seção de Histórico e marcada como tal.
