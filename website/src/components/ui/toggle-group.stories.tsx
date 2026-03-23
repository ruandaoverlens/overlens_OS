import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = {
  title: "Base Components/ToggleGroup",
  tags: ["autodocs"],
  component: ToggleGroup,
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
    },
    outlined: { control: "boolean" },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: { control: "boolean" },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Group of toggle buttons built on Radix UI ToggleGroup primitive, supporting single or multiple selection with shared variant and size context.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<ToggleGroup type=\"single\" size=\"default\" outlined={false}>",
          "  <ToggleGroupItem value=\"left\" aria-label=\"Align left\">",
          "    <AlignLeft />",
          "  </ToggleGroupItem>",
          "  <ToggleGroupItem value=\"center\" aria-label=\"Align center\">",
          "    <AlignCenter />",
          "  </ToggleGroupItem>",
          "</ToggleGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `ToggleGroup` | Root container wrapping `ToggleGroupPrimitive.Root`. Provides `ToggleGroupContext` with `outlined`, `size`, and `spacing` values to children. Sets `data-variant`, `data-size`, and `data-spacing` attributes. |",
          "| `ToggleGroupItem` | Individual toggle button wrapping `ToggleGroupPrimitive.Item`. Inherits `outlined`, `size`, and `spacing` from context but can override them locally. |",
          "",
          "## ToggleGroup Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `type` | `'single' \\| 'multiple'` | - | Selection mode (required by Radix) |",
          "| `size` | `'default' \\| 'sm' \\| 'lg'` | `'default'` | Shared size: `sm` = `h-8`, `default` = `h-9`, `lg` = `h-10` |",
          "| `outlined` | `boolean` | `false` | Sets `data-variant=\"outline\"` on root |",
          "| `spacing` | `number` | `0` | Gap between items via CSS `--gap` custom property |",
          "",
          "## Key details",
          "",
          "- Items use `rounded-[6px]` with no border, transparent background by default",
          "- Active state (`data-[state=on]`): `bg-accent text-[var(--surface-200)]`",
          "- Disabled items get `opacity-20` and `pointer-events-none`",
          "- Uses `data-slot` attributes: `toggle-group`, `toggle-group-item`",
          "- Reuses `toggleVariants` from the Toggle component for consistent sizing",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "multiple" as const,
  },
  render: (args) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ToggleGroup {...(args as any)}>
      <ToggleGroupItem value="bold" aria-label="Alternar negrito"><Bold /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Alternar italico"><Italic /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Alternar sublinhado"><Underline /></ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const boldToggle = canvas.getByRole("button", { name: "Alternar negrito" });
    const italicToggle = canvas.getByRole("button", { name: "Alternar italico" });
    await expect(boldToggle).toHaveAttribute("data-state", "off");

    await userEvent.click(boldToggle);
    await expect(boldToggle).toHaveAttribute("data-state", "on");

    await userEvent.click(italicToggle);
    await expect(italicToggle).toHaveAttribute("data-state", "on");
    await expect(boldToggle).toHaveAttribute("data-state", "on"); // multiple: both stay on
  },
};

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="center">
      <ToggleGroupItem value="left" aria-label="Alinhar esquerda"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Alinhar centro"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Alinhar direita"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
      <ToggleGroupItem value="bold" aria-label="Alternar negrito"><Bold /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Alternar italico"><Italic /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Alternar sublinhado"><Underline /></ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Both bold and italic should already be selected via defaultValue
    const boldToggle = canvas.getByRole("button", { name: "Alternar negrito" });
    const italicToggle = canvas.getByRole("button", { name: "Alternar italico" });
    const underlineToggle = canvas.getByRole("button", { name: "Alternar sublinhado" });

    await expect(boldToggle).toHaveAttribute("data-state", "on");
    await expect(italicToggle).toHaveAttribute("data-state", "on");
    await expect(underlineToggle).toHaveAttribute("data-state", "off");

    // Click underline to add a third selection - verifies multi-select allows adding
    await userEvent.click(underlineToggle);
    await expect(underlineToggle).toHaveAttribute("data-state", "on");

    // Previous selections should remain on
    await expect(boldToggle).toHaveAttribute("data-state", "on");
    await expect(italicToggle).toHaveAttribute("data-state", "on");
  },
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" outlined>
      <ToggleGroupItem value="left" aria-label="Alinhar esquerda"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Alinhar centro"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Alinhar direita"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium">Seleção única</p>
        <ToggleGroup type="single" defaultValue="center">
          <ToggleGroupItem value="left" aria-label="Alinhar esquerda"><AlignLeft /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Alinhar centro"><AlignCenter /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Alinhar direita"><AlignRight /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium">Múltipla seleção</p>
        <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
          <ToggleGroupItem value="bold" aria-label="Alternar negrito"><Bold /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Alternar italico"><Italic /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Alternar sublinhado"><Underline /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium">Outlined</p>
        <ToggleGroup type="single" outlined>
          <ToggleGroupItem value="left" aria-label="Alinhar esquerda"><AlignLeft /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Alinhar centro"><AlignCenter /></ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Alinhar direita"><AlignRight /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};
