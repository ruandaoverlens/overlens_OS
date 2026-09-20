---
title: Grafo de Capacidades
summary: Descreve a ambição de responder, por pessoa, o que ela consegue fazer, quais capacidades desenvolveu, quais projetos realizou, quais evidências existem, no que trabalha, no que quer se transformar, que conhecimentos ajudam e quem pode colaborar. Registra o conceito como hipótese, sem definir modelo de dados ou arquitetura técnica.
topics: [grafo de capacidades, competências, dados, moat, produto, conexão, personalização]
keywords: [grafo de capacidades, competências, capacidade demonstrada, dado de capacidade, moat, conexão entre pessoas, projetos, evidências, recomendação, personalização, hipótese]
priority: high
ai_when_to_use: |
  Use quando o usuário perguntar o que é o grafo de capacidades da Overlens, por que ele é considerado o candidato a moat mais forte e menos existente, o que ele precisaria conseguir responder, ou o que seria necessário para construí-lo.
related: []
---

# Grafo de Capacidades

## A ambição é simples de enunciar e difícil de qualquer outra forma: que a Overlens consiga dizer o que cada pessoa consegue fazer — e não apenas o que ela consumiu.

**Status: HIPÓTESE. Não existe.** Esta página descreve um conceito e o que ele exigiria, não um sistema em construção. Nenhuma decisão de modelo de dados, schema ou arquitetura técnica foi tomada, e nenhuma deve ser inferida daqui.

A pergunta que quase toda plataforma de educação sabe responder é "o que essa pessoa estudou". É uma pergunta de consumo, e ela é fácil porque o dado aparece sozinho: basta registrar cliques, conclusões e tempo de sessão.

A pergunta que a Overlens precisaria responder é outra, e ela não se responde com dado de consumo.

## O que precisaria ser respondido, por pessoa

| Pergunta | Natureza do dado |
| :---- | :---- |
| **O que ela consegue fazer?** | Capacidade demonstrada, não declarada. |
| **Quais capacidades desenvolveu?** | Progressão ao longo do tempo, não estado estático. |
| **Quais projetos realizou?** | Trabalho concluído, com escopo e resultado. |
| **Quais evidências existem disso?** | Artefato verificável, não autorrelato. |
| **No que está trabalhando agora?** | Contexto presente — o que torna uma sugestão relevante hoje. |
| **No que quer se transformar?** | Intenção declarada, que dá direção ao restante. |
| **Que conhecimentos ajudam?** | Ligação entre necessidade e repertório disponível. |
| **Quem na comunidade pode colaborar?** | Ligação entre pessoas, a partir do que cada uma consegue fazer. |

O nome "grafo" vem da última linha da tabela. As sete primeiras perguntas poderiam, em tese, ser respondidas por um perfil. A oitava não: ela exige que pessoas, projetos, capacidades e conhecimentos estejam relacionados entre si, e que essas relações possam ser percorridas.

## Por que isso é diferente de um perfil

Um perfil é declarado pela pessoa e envelhece. Currículo é a versão mais conhecida do problema: quem escreve decide o que aparece, ninguém verifica, e a distância entre o texto e a capacidade real é invisível.

O que se pretende aqui é o oposto em três aspectos:

**É derivado, não declarado.** A capacidade aparece porque algo foi feito, não porque foi afirmado.

**Acumula com o uso.** Cada projeto concluído e cada evidência registrada tornam a leitura mais precisa, em vez de exigir atualização manual.

**Serve para conectar, não para exibir.** A função primária não é mostrar quem alguém é; é encontrar o conhecimento certo, a pessoa certa, a ferramenta certa e o contexto certo para avançar um projeto.

## Por que é o candidato a moat mais forte

`Business Document › Moats` classifica este item como **"o de maior potencial e o menos existente"**. Vale reproduzir o raciocínio sem redefini-lo: um concorrente novo pode copiar conteúdo, método e interface, mas não pode copiar um histórico de capacidade demonstrada que se acumulou ao longo de anos com pessoas específicas.

É também o candidato com a contra-argumentação mais dura: é a hipótese mais cara e mais longa de construir, e depende inteiramente de as pessoas registrarem o próprio trabalho. Sem registro, não há insumo — e um grafo sem insumo é uma estrutura vazia com custo de manutenção.

## O que isto exigiria

**HIPÓTESE.** O que teria que existir antes, na ordem em que a dependência se impõe:

1. **Projetos reais acontecendo dentro do ecossistema.** Sem projeto, não há o que observar.
2. **Registro de execução com fricção baixa.** Se registrar custar caro, ninguém registra — e o sistema morre de fome. Ver `Sistema › Evidências e Progresso`.
3. **Um vocabulário comum de capacidades.** Sem linguagem compartilhada, o mesmo trabalho é descrito de cinco formas e nada se conecta. Isso é decisão de produto e de marca, não um detalhe técnico.
4. **Critério de verificação.** Alguma forma de distinguir capacidade demonstrada de capacidade afirmada, sem transformar o processo em certificação burocrática.
5. **Capacidade técnica e tempo de construção.** A aposta correspondente no Business Document registra isto explicitamente como condição.

## Os riscos próprios deste conceito

**Virar gamificação.** Capacidade não é ponto, nível ou selo. Se a representação da capacidade se tornar mais interessante que a capacidade, o sistema passa a medir a si mesmo.

**Virar vigilância.** Observar trabalho é diferente de monitorar pessoas. A fronteira entre acompanhar progresso e produzir um registro permanente de desempenho precisa ser desenhada antes, não depois.

**Virar julgamento.** O público da Overlens é definido pelo estado, não pela profissão nem pela senioridade. Um sistema que classifica pessoas por capacidade acumulada pode reintroduzir hierarquia justamente onde a companhia decidiu não ter uma.

**Viés de quem registra mais.** Quem documenta melhor aparece melhor. Isso não é o mesmo que fazer melhor.

## O que está em aberto

- **PENDENTE.** O que é uma capacidade dentro da Overlens e como ela é nomeada.
- **PENDENTE.** Como capacidade é verificada, e por quem.
- **PENDENTE.** O que a pessoa vê do próprio grafo, e o que é visível para os outros.
- **PENDENTE.** Como o dado se relaciona com reputação e papéis na comunidade — decisão que pertence ao **Community System**, não a este documento.
- **PENDENTE.** Tudo o que for modelo de dados, arquitetura ou implementação. Nada disso foi decidido, e preencher com suposição seria o erro que este sistema existe para evitar.

A aposta correspondente é `Business Document › Strategic Bets › Aposta 8 · Sistema operacional de aprendizagem e realização`.
