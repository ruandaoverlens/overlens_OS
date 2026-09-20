---
title: Overlens OS
summary: Documenta a plataforma proprietária da Overlens — os módulos que existem hoje, a stack, o modelo de acesso e os riscos técnicos registrados. Explica por que construir plataforma própria é estratégico, qual é o custo dessa escolha e quais indicadores provariam ou refutariam a decisão, registrando que nenhum deles está medido.
topics: [plataforma, Overlens OS, tecnologia, arquitetura, módulos, acesso, riscos técnicos]
keywords: [Overlens OS, plataforma própria, Next.js, React, Supabase, Vercel, Infisical, OpenRouter, base de conhecimento, assistente, assets, mycelium, registros, ferramentas, papéis, staff, admin, ADR, custo variável de IA]
priority: high
ai_when_to_use: |
  Use quando o usuário perguntar o que é o Overlens OS, quais módulos a plataforma tem hoje, qual é a stack técnica, quem acessa o quê, por que a Overlens constrói plataforma própria, quanto custa essa escolha ou quais riscos técnicos estão registrados.
related: []
---

# Overlens OS

## A plataforma própria da Overlens existe e funciona. O que ela faz hoje, porém, não é o produto descrito neste sistema — é a operação interna da companhia.

**Status: DEFINIDO quanto ao que existe · EM VALIDAÇÃO quanto à decisão de construir · PENDENTE quanto à medição.**

Esta página levanta fatos, não intenções. Cada módulo listado abaixo existe no código. Nada que não exista foi incluído, e nada que exista foi omitido por não caber na narrativa.

## O que existe hoje

**DEFINIDO — verificado no código.** O Overlens OS é uma aplicação web única que reúne:

| Módulo | O que faz |
| :---- | :---- |
| **Base de conhecimento** | Leitura navegável dos sistemas documentais da companhia: Brand System, Business Document, Growth System, Content System, Product System, Community System, Pacote Cultural e os playbooks de conteúdo e de edição de vídeos. |
| **Edição de páginas** | Edição das páginas da base pela própria interface, restrita a administradores. |
| **Assistente** | Conversa com IA sobre a base documental, com histórico de conversas, seleção de modelo, citação de trechos e feedback por mensagem. |
| **Assets** | Biblioteca de arquivos com upload, upload em lote por link, pré-visualização, renomeação, ocultação, download e metadados. |
| **Mycelium** | Biblioteca de referências com tipos variados — artigo, vídeo, imagem, áudio, PDF, skill, post, site —, anexos, capas e tags. |
| **Registros** | Gestão de propriedade intelectual: marcas, domínios, documentos, processos, alertas, radar, jornada guiada de registro e assistente próprio. |
| **Ferramentas** | Utilitários independentes: calculadora de tempo, conversor de cores, conversor de formato, otimizador de imagens, otimizador de prompts e gerador de QR code. |
| **Administração** | Gestão de membros, painel de insights e leitura de conversas. |
| **Notificações** | Central de avisos da plataforma. |

**Observação relevante e desconfortável:** nenhum desses módulos é a experiência de aprendizagem, projeto e evidência descrita nos demais capítulos deste sistema. **O Overlens OS de hoje é a plataforma interna da companhia, não a plataforma do Atom.** Confundir as duas é o erro mais fácil de cometer ao ler esta página.

## Stack

**DEFINIDO.**

| Camada | Tecnologia |
| :---- | :---- |
| **Aplicação** | Next.js 16 e React 19 |
| **Backend e dados** | Supabase — autenticação, banco e storage |
| **Hospedagem** | Vercel · `main` em produção, demais branches em preview |
| **Segredos** | Infisical, com ambientes `dev`, `preview` e `production`, sincronizados para a Vercel |
| **IA** | OpenRouter, com modelos abertos como padrão e modelos pagos disponíveis por seleção |
| **Rotinas automáticas** | Duas tarefas agendadas, ambas do módulo Registros: varredura de alertas diária e ingestão do radar semanal |

## Modelo de acesso

**DEFINIDO.** Quatro papéis: `gratuito`, `assinante`, `staff` e `admin`.

Gratuito e assinante alcançam um conjunto restrito de rotas. Staff e admin alcançam praticamente o mesmo conjunto — a diferença entre eles não é navegação, e sim duas ações: apagar membros e editar textos das páginas, ambas exclusivas de admin. O módulo Registros não é controlado por papel, e sim por domínio de e-mail: apenas a equipe interna acessa.

As decisões de acesso estão registradas em `docs/adr/0002-autorizacao-e-controle-de-acesso.md`.

## Decisões já registradas

**DEFINIDO.** Os ADRs existentes cobrem quatro assuntos: o módulo de ativos registrados, a autorização e o controle de acesso, a consulta de disponibilidade de marcas e a jornada guiada de registro de marca — esta última ainda como proposta.

Três dos quatro tratam do módulo Registros. **Nenhuma decisão arquitetural sobre aprendizagem, projeto, capacidade, evidência ou IA contextual está registrada.** Isso é informação por si só: a área com mais decisões documentadas é a que menos pesa na tese.

## Por que plataforma própria é estratégico

**EM VALIDAÇÃO.** Quatro razões, na ordem em que sustentam a tese:

**Retenção real, e não contratual.** Uma plataforma que acompanha projeto, capacidade e evidência dá motivo recorrente para voltar. Conteúdo hospedado em ferramenta de terceiros entrega acesso; não entrega continuidade.

**Conteúdo vira infraestrutura.** Em ferramenta genérica, conteúdo é arquivo em pasta. Em plataforma própria, ele pode ser relacionado, convocado por necessidade e ligado a projeto — que é precisamente o que `Fundamentos › Projeto como Unidade Central` exige.

**Gera dado.** Sem superfície própria não há registro, e sem registro não há grafo de capacidades nem IA contextual. A hipótese mais valiosa do produto depende de existir um lugar onde as coisas aconteçam.

**É prova da tese.** A Overlens afirma que pessoas de origens diversas podem construir coisas reais integrando disciplinas. Construir o próprio sistema é a versão mais direta dessa afirmação — e, se falhar, também é a refutação mais direta.

## O que essa escolha custa

**DEFINIDO — custos reais, não hipotéticos:**

**Capacidade desviada.** Cada hora de construção de plataforma é uma hora que não foi para conteúdo, comunidade, vendas ou entrega de serviço. Em uma companhia com nove apostas estratégicas simultâneas, esse é o custo mais pesado.

**Custo variável de IA.** Cresce com a adoção e hoje não é medido. Registrado em `Business Document › Riscos e Incertezas › E5`.

**Manutenção permanente.** Software não fica pronto. Dependências, segurança, quebras de fornecedor e dívida técnica passam a ser obrigação contínua, independentemente de haver roadmap.

**Concentração de conhecimento.** Poucas pessoas entendem o sistema inteiro. Isso torna a companhia dependente de indivíduos específicos — o mesmo padrão de risco que ela já tem na camada de atenção.

**Superfície de risco.** Dados de membros, autenticação, arquivos e documentação estratégica interna passam a ser responsabilidade da companhia. Há um agravante já conhecido e registrado: **desenvolvimento, preview e produção compartilham o mesmo projeto Supabase**, o que significa que operação destrutiva em desenvolvimento atinge dado de produção.

## Os indicadores que provariam a decisão

**PENDENTE — nenhum deles está medido hoje.**

A decisão de construir plataforma própria seria confirmada ou refutada por indicadores como:

1. Proporção de pessoas que retornam por causa de um projeto em andamento, e não por conteúdo novo.
2. Volume de evidência efetivamente registrada por quem constrói.
3. Uso da IA contextual em comparação com ferramentas gerais, e perda percebida ao substituí-la.
4. Custo de IA por pessoa ativa, acompanhado ao longo do tempo.
5. Custo de manutenção da plataforma em proporção à capacidade total da companhia.
6. Tempo entre decidir uma mudança de produto e ela estar em uso — a velocidade que justifica ter sistema próprio.

Nenhum desses seis números existe. A companhia tem produto em uso e instrumentação insuficiente, e a ausência de medição é o principal motivo pelo qual esta decisão permanece **EM VALIDAÇÃO** em vez de DEFINIDA.

## O que está em aberto

- **PENDENTE.** Se o Overlens OS deve se tornar a plataforma do Atom ou permanecer como sistema interno, com a experiência do público em outro lugar.
- **PENDENTE.** Instrumentação de produto — não existe hoje.
- **PENDENTE.** Separação de ambientes de dados entre desenvolvimento e produção.
- **PENDENTE.** ADRs sobre aprendizagem, projeto, capacidade e evidência. Antes de implementar qualquer uma dessas frentes, a decisão precisa ser registrada.
