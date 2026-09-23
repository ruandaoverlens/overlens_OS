import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DocPagination } from "./doc-pagination";

const meta = {
  title: "Base de Conhecimento/DocPagination",
  tags: ["autodocs"],
  component: DocPagination,
  parameters: {
    // `useRouter` de `next/navigation`: sem isto o Storybook monta o router
    // de páginas e o componente quebra.
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component: [
          "Navegação entre páginas de um system, com os atalhos `[` e `]`.",
          "",
          "A seta fica sempre na borda externa e o atalho na borda interna. O recuo é assimétrico de propósito: o chip do atalho tem fundo próprio e pede mais respiro do que o traço fino da seta.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof DocPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const prev = { title: "Missão", segments: ["01-overview", "03-missao"] };
const next = {
  title: "Business Model Canvas",
  segments: ["02-modelos", "01-business-model-canvas"],
};

export const Default: Story = {
  args: { prev, next, basePath: "/business" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Missão")).toBeInTheDocument();
    await expect(canvas.getByText("Business Model Canvas")).toBeInTheDocument();
  },
};

export const SoAnterior: Story = {
  name: "Só a página anterior",
  args: { prev, next: null, basePath: "/business" },
};

export const SoProxima: Story = {
  name: "Só a próxima página",
  args: { prev: null, next, basePath: "/business" },
};
