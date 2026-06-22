import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  PhosphorGallery,
  WeightsShowcase,
  SizesShowcase,
} from "./phosphor-gallery";

/**
 * Iconografia oficial da Overlens.
 *
 * A documentação completa vive no campo `docs.description` abaixo e aparece
 * na aba **Docs** desta entrada do Storybook.
 */
const meta = {
  title: "Icons/Phosphor",
  component: PhosphorGallery,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "# Iconografia — Phosphor",
          "",
          "A iconografia oficial do design system da Overlens é o **[Phosphor](https://phosphoricons.com/)**.",
          "Todo **novo componente** deve usar Phosphor. O catálogo tem 1500+ ícones em 6 pesos, com API consistente e tree-shaking nativo.",
          "",
          "> **Ícones legados:** o set SVG customizado (`Md*`, `Sm*`, `Micro*` em `@/components/icons`) continua",
          "> em uso nos componentes já existentes e **não deve ser migrado**. Use Phosphor apenas daqui pra frente.",
          "",
          "## Instalação",
          "",
          "Já disponível no projeto: `@phosphor-icons/react`.",
          "",
          "## Uso",
          "",
          "```tsx",
          'import { MagnifyingGlass } from "@phosphor-icons/react";',
          "",
          "<MagnifyingGlass />                // 1em, weight regular, herda currentColor",
          '<MagnifyingGlass weight="bold" />  // peso mais encorpado',
          '<MagnifyingGlass size={20} />      // tamanho explícito em px',
          "```",
          "",
          "### Server Components (Next App Router)",
          "",
          "Os componentes do Phosphor são client por padrão (usam `IconContext`). Em **Server Components**,",
          "importe da entrada SSR para evitar marcar a árvore como `\"use client\"`:",
          "",
          "```tsx",
          'import { MagnifyingGlass } from "@phosphor-icons/react/ssr";',
          "```",
          "",
          "## Pesos (weights)",
          "",
          "Phosphor entrega 6 pesos do mesmo desenho. Escolha **um peso dominante por superfície** e mantenha a consistência:",
          "",
          "| Weight | Quando usar |",
          "| --- | --- |",
          "| `thin` / `light` | Acentos sutis, estados desabilitados, ilustração fina |",
          "| `regular` | **Padrão** da UI — ícones de ação, navegação, inline com texto |",
          "| `bold` | Ênfase, ícones pequenos que precisam de presença |",
          "| `fill` | Estados ativos/selecionados (ex.: item de nav atual, favorito marcado) |",
          "| `duotone` | Destaques expressivos, vazios, onboarding — usar com parcimônia |",
          "",
          "## Tamanho",
          "",
          "O `size` padrão é `1em`, então o ícone **acompanha o `font-size`** do contexto por padrão.",
          "Para tamanhos fixos, use `size={n}` (px) ou as classes utilitárias (`className=\"size-5\"`).",
          "Escala recomendada: **16 / 20 / 24** para UI; 32+ para destaques.",
          "",
          "## Cor",
          "",
          "Por padrão o ícone herda `currentColor` — basta controlar a cor do texto",
          "(`text-foreground`, `text-muted-foreground`, etc.). Evite a prop `color` fixa; prefira tokens via classe.",
          "",
          "## Defaults globais (opcional)",
          "",
          "Para padronizar peso/tamanho numa subárvore, use o `IconContext.Provider`:",
          "",
          "```tsx",
          'import { IconContext } from "@phosphor-icons/react";',
          "",
          '<IconContext.Provider value={{ weight: "regular", size: 20 }}>',
          "  {children}",
          "</IconContext.Provider>",
          "```",
          "",
          "A galeria abaixo é uma **seleção curada** dos ícones mais usados na UI da Overlens.",
          "Para o catálogo completo, navegue em **[phosphoricons.com](https://phosphoricons.com/)**.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof PhosphorGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Galeria curada e navegável — troque o peso e busque por nome. */
export const Gallery: Story = {};

/** O mesmo ícone nos 6 pesos do Phosphor. */
export const Weights: StoryObj = {
  render: () => <WeightsShowcase />,
  parameters: {
    docs: {
      description: {
        story:
          "Use `weight` para alternar entre os 6 pesos. `regular` é o padrão da UI; `fill` para estados ativos.",
      },
    },
  },
};

/** Escala de tamanhos via prop `size` (px). Na UI prefira 16 / 20 / 24. */
export const Sizes: StoryObj = {
  render: () => <SizesShowcase />,
  parameters: {
    docs: {
      description: {
        story:
          "O tamanho padrão é `1em` (acompanha o `font-size`). Use `size={n}` ou classes (`size-5`) para fixar.",
      },
    },
  },
};
