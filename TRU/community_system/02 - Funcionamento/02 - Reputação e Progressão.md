# Reputação e Progressão

## Todo sistema de reconhecimento ensina alguma coisa. A pergunta não é se vamos medir, é o que as pessoas vão aprender a perseguir quando descobrirem o que estamos medindo.

**Estado desta página:** <dado q="C" nota="Hipótese em todas as afirmações sobre mecanismo." /> **Não existe sistema de reputação decidido, implementado ou validado na Overlens.**

O que existe é um problema real e duas armadilhas conhecidas. Esta página trata dos três.

## O problema real

Comunidades dependem de confiança, e confiança em escala pequena é resolvida por conhecimento pessoal: todo mundo sabe quem entrega, quem ajuda, quem some. Esse mecanismo quebra por volta do momento em que as pessoas deixam de se reconhecer.

A partir daí, alguém que procura um colaborador não tem como saber em quem confiar. Alguém que contribuiu muito não tem como ser encontrado. O sistema volta a favorecer quem fala mais alto, e não quem entrega melhor.

Reputação, nesse sentido, é **infraestrutura de confiança em escala**. É o que permite que a probabilidade de encontro útil continue subindo depois que a comunidade deixa de caber em uma sala.

## Reputação não é gamificação

**A distinção é conceitual e precede qualquer decisão de implementação.**

| | Reputação | Gamificação |
| :---- | :---- | :---- |
| **O que mede** | O que a pessoa fez e que valor isso teve para outros | Atividade dentro do sistema |
| **Quem atribui** | A comunidade, por consequência da contribuição | O sistema, por regra definida |
| **Para que serve** | Permitir que estranhos confiem uns nos outros | Sustentar frequência de uso |
| **Risco principal** | Concentrar visibilidade em poucos | Ensinar a perseguir o indicador em vez do trabalho |

A gamificação não é ilegítima: ela resolve bem um problema específico, que é iniciar e manter hábito. O erro é tratá-la como se fosse reputação. Pontos por presença medem presença. Não medem se alguém é bom, confiável ou útil.

## A gamificação herdada

<dado q="D" nota="Quanto ao papel." /> <dado q="C" nota="Quanto à implementação futura." />

O modelo anterior da companhia usava gamificação (**XP, missões, badges, ofensiva, ranking, fractais, certificados**) como principal mecanismo de permanência, dentro de um growth loop organizado em aquisição → ativação → retenção → receita → indicação. O registro está no **Business Document**, em Histórico <dado fonte="Business Document › Histórico" />.

Duas consequências para este sistema:

1. **Esses mecanismos permanecem disponíveis como possibilidade de implementação.** Nenhum deles é proibido. Badges, missões e certificados podem voltar a existir se resolverem um problema identificado.
2. **Nenhum deles é o mecanismo de valor.** O que sustenta a permanência de um Atom, na tese atual, é o que ele consegue construir e com quem, não a sequência de dias ativos.

Também vale a proibição explícita: **não assumir que os quatro modos (Operante, Convergente, Emergente, Nexialista) constituam um sistema formal de gamificação.** Eles descrevem formas de agir. Transformá-los em níveis de pontuação seria criar uma hierarquia que a própria formulação recusa.

## Sobre o que a reputação poderia se construir

<dado q="C" /> Três fontes parecem coerentes com a tese, e todas têm em comum o fato de serem consequência de trabalho, não de atividade:

**Por contribuição.** O que a pessoa colocou na comunidade que outros usaram: respostas, referências, feedback, conexões feitas. Mede utilidade para terceiros.

**Por projeto entregue.** O que a pessoa construiu e que existe no mundo. É a forma mais próxima do que a companhia chama de **evidência**: não o que alguém sabe, mas o que alguém fez.

**Por ajuda prestada.** Acompanhamento que fez diferença no projeto de outra pessoa. É a fonte mais difícil de observar e provavelmente a mais valiosa, porque é a que menos se finge.

O Business Document trata o registro de **capacidade demonstrada** como candidata a vantagem defensável <dado fonte="Business Document" />, dados de capacidade e não de consumo. Reputação comunitária é uma das formas possíveis de alimentar esse registro, e depende inteiramente de infraestrutura que ainda não existe: essa parte pertence ao **Product System**.

## Progressão

<dado q="E" /> Não existem níveis formais, faixas, categorias de membro ou critérios de avanço definidos na comunidade da Overlens. Nada disso deve ser inferido a partir dos quatro modos, das ofertas ou do modelo anterior.

O que pode ser registrado como princípio, e não como sistema: progressão na Overlens é **aumento de capacidade**, verificável por evidência. Se um dia existir representação formal disso, ela deveria descrever o que a pessoa consegue fazer, não há quanto tempo ela está por aqui.

## Riscos a considerar antes de implementar qualquer coisa

Quatro riscos são previsíveis e devem estar sobre a mesa quando a decisão for tomada:

- **O indicador vira o objetivo.** Assim que o critério é publicado, ele passa a ser otimizado. Todo sistema de reputação ensina um comportamento; convém escolher qual.
- **Concentração.** Reputação tende a acumular em quem já tem visibilidade, o que reduz a chance de alguém novo ser encontrado.
- **Punição ao silêncio produtivo.** Quem constrói muito e comunica pouco tende a ficar invisível em qualquer sistema baseado em atividade observável.
- **Competição onde deveria haver colaboração.** Ranking público entre pessoas que deveriam cooperar é a forma mais rápida de reduzir cooperação.

## O que falta decidir

1. Se existirá sistema formal de reputação e, em caso afirmativo, se público ou privado.
2. Que comportamentos ele reconhece, e qual comportamento isso ensina.
3. Se gamificação volta, para que problema específico e com que limite.
4. Se progressão será representada formalmente, e com base em quê.

Enquanto essas decisões não existirem, reconhecimento na comunidade acontece por percepção e por relação, que é honesto em escala pequena e insuficiente em qualquer outra.
