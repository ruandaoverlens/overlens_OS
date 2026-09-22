# ADR-0005 — Tema claro e escala de superfície relativa ao tema

- **Status**: Proposto
- **Data**: 2026-09-22
- **Decisores**: Ruan Braz

## Contexto

A plataforma nasceu `dark-only`. Os tokens de cor viviam todos em `:root` de
`website/src/app/globals.css`, o `<html>` recebia `className="dark"` fixo e o
`viewport` declarava `colorScheme: "dark"`. O cabeçalho do arquivo dizia, em
letras maiúsculas, `DARK-ONLY THEME — Platform is dark-only`.

Sobre essa base, os componentes se acostumaram a dois atalhos:

1. Usar a escala primitiva `surface/*` como se fosse semântica — `bg-surface-950`
   para "o card mais discreto", `text-surface-500` para "texto secundário".
   São ~200 ocorrências espalhadas por toda a aplicação.
2. Escrever preto e branco literais (`bg-black`, `text-white`, `bg-white/[0.04]`,
   hexadecimais em SVG e `style`) sempre que o token semântico não existia.
   Eram ~57 arquivos.

Enquanto só existia um tema, nenhum dos dois atalhos custava nada.

## Problema

Como acrescentar um tema claro completo sem reescrever ~200 usos da escala de
superfície, e sem deixar a base com duas convenções de cor convivendo?

## Decisão

Vamos manter **dois temas** — `dark` como padrão do produto, `light` completo,
`system` como opção explícita — com as seguintes sub-decisões estruturais.

**1. `:root` carrega o tema claro; `.dark` sobrescreve o escuro.**
É a convenção do shadcn e a que o Tailwind já espera (`@custom-variant dark`).
O `next-themes` escreve a classe no `<html>` antes da hidratação, então não há
flash de tema errado.

**2. A escala `surface/*` passa a ser RELATIVA ao tema, não literal.**
`surface-black` é sempre o polo do **fundo** (`#000` no escuro, `#FFF` no claro)
e `surface-white` é sempre o polo de **contraste máximo** (`#FFF` no escuro,
`#101010` no claro). Os degraus intermediários invertem junto.

É a decisão central deste ADR. Ela reconhece o uso real: a base já tratava a
escala como semântica. Ao inverter a escala, os ~200 usos passam a funcionar nos
dois temas sem uma única alteração de componente — e continuam significando
exatamente o que já significavam. Os degraus foram calibrados para **espelhar os
contrastes WCAG** do tema escuro, não por inversão aritmética: `text-surface-500`
dá 5,30:1 sobre o fundo nos dois temas.

**3. Preto e branco literais ganham tokens próprios: `--absolute-white` e
`--absolute-black`.**
Uma amostra de paleta, o fundo de preview de um logo monocromático, o véu sobre
uma foto e o "papel" de um QR code são a própria cor — não podem inverter. Com
um token nomeado, a intenção fica legível no código e não volta a ser
"consertada" por engano.

**4. Cores de marca não invertem; ganham variantes de texto.**
`--brand-*` é paleta de marca e permanece igual nos dois temas. Quando a cor
precisa virar **texto** sobre o fundo do tema, usa-se `--brand-*-text`, que no
escuro é a própria cor e no claro vem rebaixada. A calibragem é feita contra o
pior caso real — a própria cor em tinta de 15% sobre um card — e não contra o
branco puro.

**5. Preenchimento e limite de campo viram tokens distintos.**
`--input` pinta o **fundo** do campo (`bg-input/30`, 47 usos); `--field-border`
pinta o **limite** (18 usos). Separados porque o limite precisa de 3:1 contra a
página (WCAG 1.4.11) e o fundo, com esse peso, viraria um bloco cinza. O mesmo
token de limite serve a qualquer controle cujo contorno seja a única pista de
que ele existe — alça de redimensionamento, separador de `ButtonGroup`.

**6. O contraste passa a ser verificado por script, não por inspeção.**
`website/scripts/check-theme-contrast.mjs` (`npm run check:contrast`) lê os
tokens do CSS, resolve as referências `var()` e mede 42 pares texto/fundo nos
dois temas. Sai com código 1 se algum ficar abaixo do alvo WCAG 2.2 AA.

**7. O Storybook ganha um seletor de tema na barra de ferramentas**, e o
`preview-head.html` deixa de fixar `background: #000000`.

## Alternativas consideradas

**Manter a escala `surface/*` literal e migrar os ~200 usos para tokens
semânticos.** Seria o "certo" pela teoria de design tokens: primitivo é
primitivo. Descartada porque exigiria inventar tokens semânticos para uma
dúzia de papéis que hoje não existem, tocar quase todos os componentes da
aplicação num único passo, e porque o significado que os componentes já dão à
escala é consistente — o problema não era o uso, era o nome prometer literalidade.

**Duplicar cada classe com variantes `dark:`.** Dobraria o tamanho de quase toda
`className` do projeto e deixaria o tema claro como enxerto permanente em vez de
um tema de primeira classe.

**Tema claro só via `prefers-color-scheme`, sem seletor.** Tira do usuário a
escolha e não resolve o caso mais comum — quem usa o sistema no claro mas quer a
plataforma escura, ou o contrário.

**`defaultTheme="system"`.** Descartada: mudaria a aparência da plataforma para
todos os usuários atuais cujo sistema está no claro, sem que ninguém tenha pedido.
O padrão continua `dark`; `system` é uma escolha explícita no seletor.

## Consequências

**Melhora.** Há tema claro completo e um seletor no canto superior direito da
topbar de todas as rotas e da tela de login. A cobertura de contraste virou teste
automatizado. Vários problemas que já existiam **no tema escuro** apareceram e
foram corrigidos no caminho: campos de formulário sem limite visível (1,2:1),
texto branco sobre o verde de sucesso (3,95:1), alça de redimensionamento quase
invisível, ~230 ícones sem `aria-hidden`.

**Fica mais caro.** Toda cor nova precisa ser pensada nos dois temas. Toda
imagem de marca de cor chapada precisa do par `-light`/`-dark`, trocado por CSS
(`dark:hidden` / `hidden dark:block`) e nunca por `useTheme()`, que só resolve
depois da hidratação.

**Passa a ser obrigatório:**

- Nenhuma cor literal nova em componente. Preto e branco só via `--absolute-*`,
  com comentário explicando por que é literal.
- `npm run check:contrast` verde antes de mexer em qualquer token de cor.
- Ícone do design system nasce `aria-hidden`; quem o usa como rótulo passa
  `aria-label`. Ao regerar os ícones, preservar esse padrão.
- Componente novo precisa ser conferido nos dois temas no Storybook.

## Critérios de sucesso

- `npm run check:contrast` passa nos 84 pares (42 × 2 temas).
- Varredura de `bg-black`/`text-white`/`bg-white`/hexadecimal em `src/`
  retorna apenas ocorrências marcadas como `--absolute-*` ou comentadas como
  dado (canvas, QR code, compressão de imagem).
- Nenhum texto abaixo de 4,5:1 (ou 3:1 quando grande) nas stories do Storybook,
  medido no DOM renderizado, nos dois temas.
- Trocar de tema não pisca e não perde a escolha entre recarregamentos.
