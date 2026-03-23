import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Spinner } from "./spinner";

const meta = {
  title: "Base Components/Spinner",
  tags: ["autodocs"],
  component: Spinner,
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for custom sizing or styling",
      table: { defaultValue: { summary: undefined } },
    },
    role: {
      control: false,
      description: "ARIA role for accessibility",
      table: { defaultValue: { summary: '"status"' } },
    },
  },
  args: { className: "h-6 w-6" },
  parameters: {
    docs: {
      description: {
        component: [
          "Spinning loading indicator rendered as a `<span>` with an accessible `role=\"status\"` and `aria-label=\"Loading\"`.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Spinner className=\"h-6 w-6\" />",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `className` | `string` | - | Controls size and color (e.g., `\"h-4 w-4\"`, `\"text-primary\"`) |",
          "",
          "## Key details",
          "",
          "- Default size is `size-4` (`1rem`) via the `inline-block size-4` base classes; override with `className`.",
          "- Animation uses `animate-spin` (continuous rotation).",
          "- Rendered as a `rounded-full` span with `border-2 border-current border-t-transparent` to create the spinner effect.",
          "- Color inherits from parent via `border-current`; override with a text color utility (e.g., `text-primary`).",
          "- Has `role=\"status\"` and `aria-label=\"Loading\"` for screen reader accessibility.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const spinner = canvas.getByRole("status");
    await expect(spinner).toBeInTheDocument();
    await expect(spinner).toHaveAttribute("aria-label", "Loading");
    await expect(spinner).toHaveClass("animate-spin");
    await expect(spinner).toHaveClass("rounded-full");
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="h-4 w-4" />
      <Spinner className="h-6 w-6" />
      <Spinner className="h-8 w-8" />
      <Spinner className="h-12 w-12" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Carregando dados...</span>
      </div>
      <div className="flex items-center gap-2">
        <Spinner className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Salvando alterações...</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <span className="text-sm text-muted-foreground">Processando seu pedido</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const spinners = canvas.getAllByRole("status");
    await expect(spinners.length).toBe(3);

    await expect(canvas.getByText("Carregando dados...")).toBeInTheDocument();
    await expect(canvas.getByText("Salvando alterações...")).toBeInTheDocument();
    await expect(canvas.getByText("Processando seu pedido")).toBeInTheDocument();
  },
};

export const InButton: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <button
        disabled
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground opacity-80"
      >
        <Spinner className="h-4 w-4" />
        <span>Enviando...</span>
      </button>
      <button
        disabled
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium opacity-80"
      >
        <Spinner className="h-4 w-4" />
        <span>Carregando</span>
      </button>
      <button
        disabled
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground opacity-80"
      >
        <Spinner className="h-4 w-4" />
        <span>Excluindo...</span>
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const buttons = canvas.getAllByRole("button");
    await expect(buttons.length).toBe(3);

    for (const button of buttons) {
      await expect(button).toBeDisabled();
    }

    const spinners = canvas.getAllByRole("status");
    await expect(spinners.length).toBe(3);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Spinner className="h-4 w-4" />
      <Spinner className="h-6 w-6" />
      <Spinner className="h-8 w-8" />
      <Spinner className="h-12 w-12" />
      <div className="flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    </div>
  ),
};
