import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./badge";

const meta = {
  title: "Base Components/Badge",
  tags: ["autodocs"],
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "primary",
        "destructive",
        "success",
        "warning",
        "info",
        "outline",
        "secondary",
        "ghost",
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Inline status indicator rendered as a `<span>` with semantic color variants. Uses CVA for variant management and Radix `Slot` for `asChild` polymorphism.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Badge variant=\"success\">Label</Badge>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `variant` | `\"default\" \\| \"primary\" \\| \"destructive\" \\| \"success\" \\| \"warning\" \\| \"info\" \\| \"outline\" \\| \"secondary\" \\| \"ghost\"` | `\"default\"` | Semantic color variant |",
          "| `asChild` | `boolean` | `false` | Merges props onto the child element via Radix `Slot.Root` |",
          "",
          "## Key details",
          "",
          "- Renders `data-slot=\"badge\"` and `data-variant` attributes for styling hooks",
          "- Uses `font-mono`, `uppercase`, `tracking-wide`, `text-xs`, and `rounded` (square corners, not pill-shaped)",
          "- Hover styles only activate when the badge is rendered as an anchor (`[a&]:hover:`)",
          "- SVG children inside the badge are sized to `size-3` via `[&>svg]:size-3`",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Padrao" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const badge = canvas.getByText("Padrao");
    await expect(badge).toBeVisible();

    await expect(badge.getAttribute("data-slot")).toBe("badge");
    await expect(badge.getAttribute("data-variant")).toBe("default");
    await expect(badge.className).toContain("bg-secondary");
  },
};

export const Primary: Story = {
  args: { variant: "primary", children: "Primario" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Erro" },
};

export const Success: Story = {
  args: { variant: "success", children: "Sucesso" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Aviso" },
};

export const Info: Story = {
  args: { variant: "info", children: "Info" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Contorno" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secundario" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Padrao</Badge>
      <Badge variant="primary">Primario</Badge>
      <Badge variant="destructive">Erro</Badge>
      <Badge variant="success">Sucesso</Badge>
      <Badge variant="warning">Aviso</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Contorno</Badge>
      <Badge variant="secondary">Secundario</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  ),
};
