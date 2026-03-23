import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Kbd, KbdGroup } from "./kbd";

const meta = {
  title: "Base Components/Kbd",
  tags: ["autodocs"],
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component: [
          "Keyboard shortcut indicator rendered as an inline key cap. Use `KbdGroup` to combine multiple keys.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<KbdGroup>",
          "  <Kbd>Ctrl</Kbd>",
          "  <Kbd>K</Kbd>",
          "</KbdGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Kbd` | Single key cap rendered as a `<kbd>` element. Styled with `bg-muted text-muted-foreground`, `h-5 min-w-5`, `rounded-sm`, and `font-mono text-xs uppercase`. Icons inside are sized to `size-3`. Has alternate styling when nested inside `[data-slot=tooltip-content]` (lighter background). Uses `data-slot=\"kbd\"`. |",
          "| `KbdGroup` | Inline container (also `<kbd>`) for grouping multiple Kbd elements with `gap-1`. Uses `data-slot=\"kbd-group\"`. |",
          "",
          "## Key details",
          "",
          "- Text is uppercase via `uppercase` and uses `select-none` to prevent accidental text selection",
          "- Pointer events are disabled via `pointer-events-none` so the keycap never interferes with click targets",
          "- Inside tooltips, the background switches to `bg-background/20` (light) or `bg-background/10` (dark) for better contrast",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: { control: "text" },
    className: { control: "text" },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Ctrl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Ctrl")).toBeInTheDocument();

    const kbd = canvasElement.querySelector('[data-slot="kbd"]');
    await expect(kbd).toBeInTheDocument();
    await expect(kbd!.tagName.toLowerCase()).toBe("kbd");
  },
};

export const Combination: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>C</Kbd>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>P</Kbd>
    </KbdGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {/* Tecla simples */}
      <Kbd>Ctrl</Kbd>

      {/* Combinacao */}
      <div className="flex items-center gap-1">
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>C</Kbd>
      </div>

      {/* Grupo */}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>

      {/* Atalhos comuns */}
      <div className="flex items-center gap-1">
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>Z</Kbd>
      </div>

      <div className="flex items-center gap-1">
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>S</Kbd>
      </div>

      <Kbd>Esc</Kbd>

      <Kbd>Enter</Kbd>
    </div>
  ),
};
