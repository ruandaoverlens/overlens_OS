import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Bold, Italic, Underline } from "lucide-react";
import { Toggle } from "./toggle";

const meta = {
  title: "Base Components/Toggle",
  tags: ["autodocs"],
  component: Toggle,
  args: {
    onPressedChange: fn(),
  },
  argTypes: {
    outlined: { control: "boolean" },
    size: { control: "select", options: ["default", "sm", "lg"] },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Two-state toggle button built on Radix UI Toggle primitive with CVA size variants and an optional outlined style.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Toggle aria-label=\"Bold\">",
          "  <Bold />",
          "</Toggle>",
          "<Toggle outlined size=\"sm\" aria-label=\"Italic\">",
          "  <Italic />",
          "</Toggle>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `size` | `'default' \\| 'sm' \\| 'lg'` | `'default'` | Controls height and padding: `sm` = `h-8`, `default` = `h-9`, `lg` = `h-10` |",
          "| `outlined` | `boolean` | `false` | Adds `border border-border` and sets `data-variant=\"outline\"` instead of `\"default\"` |",
          "| `pressed` | `boolean` | - | Controlled pressed state |",
          "| `onPressedChange` | `(pressed: boolean) => void` | - | Callback when toggle state changes |",
          "",
          "## Key details",
          "",
          "- Active state (`data-[state=on]`) applies `bg-accent` and `text-[var(--surface-200)]`",
          "- Disabled state sets `opacity-20` and `pointer-events-none`",
          "- SVG icons inside are auto-sized to `size-6` via `[&_svg:not([class*='size-'])]:size-6`",
          "- Focus ring: `ring-2 ring-foreground`",
          "- Uses `data-slot=\"toggle\"` and `data-variant` attributes",
          "- Exports `toggleVariants` CVA config for reuse in `ToggleGroup`",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <Bold />, "aria-label": "Alternar negrito" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole("button", { name: "Alternar negrito" });
    await expect(toggle).toBeInTheDocument();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).toHaveBeenCalled();
  },
};

export const Outline: Story = {
  args: { outlined: true, children: <Italic />, "aria-label": "Alternar italico" },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Underline /> Sublinhado
      </>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Toggle key={size} size={size} aria-label={`Tamanho ${size}`}>
          <Bold />
        </Toggle>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Negrito"><Bold /></Toggle>
      <Toggle outlined aria-label="Italico"><Italic /></Toggle>
      <Toggle disabled aria-label="Sublinhado"><Underline /></Toggle>
    </div>
  ),
};
