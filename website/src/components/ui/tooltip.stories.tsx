import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipShortcut, TooltipProvider } from "./tooltip";
import { Button } from "./button";

const meta = {
  title: "Base Components/Tooltip",
  tags: ["autodocs"],
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the tooltip",
    },
    defaultOpen: {
      control: "boolean",
      description: "Initial open state when uncontrolled",
      table: { defaultValue: { summary: "false" } },
    },
    onOpenChange: {
      control: false,
      description: "Callback fired when the open state changes",
    },
    delayDuration: {
      control: false,
      description: "Override the provider delay duration for this tooltip",
    },
    children: {
      control: false,
      description: "TooltipTrigger and TooltipContent elements",
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Floating tooltip built on Radix UI Tooltip primitive with arrow indicator, entrance animations, and an optional keyboard shortcut badge.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<TooltipProvider delayDuration={0}>",
          "  <Tooltip>",
          "    <TooltipTrigger asChild>",
          "      <Button>Hover me</Button>",
          "    </TooltipTrigger>",
          "    <TooltipContent side=\"top\">",
          "      Tooltip text",
          "      <TooltipShortcut>\\u2318S</TooltipShortcut>",
          "    </TooltipContent>",
          "  </Tooltip>",
          "</TooltipProvider>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `TooltipProvider` | Shared context for delay configuration. Default `delayDuration` is `0`. |",
          "| `Tooltip` | Root wrapper managing open/close state via `TooltipPrimitive.Root`. |",
          "| `TooltipTrigger` | Element that activates the tooltip on hover/focus. Use `asChild` to merge onto existing elements. |",
          "| `TooltipContent` | Floating panel rendered via `TooltipPrimitive.Portal`. Styled with `bg-foreground text-background`, `rounded-lg`, `text-xs font-medium font-body`. Includes a rotated arrow. |",
          "| `TooltipShortcut` | `<kbd>` element styled as a pill badge (`bg-black text-white`, `rounded-[4px]`, `font-mono text-xs`) for displaying keyboard shortcuts inside tooltip content. |",
          "",
          "## Key details",
          "",
          "- Entrance animations: `fade-in-0 zoom-in-95` with directional slide based on `data-[side=*]`",
          "- Exit animations: `fade-out-0 zoom-out-95`",
          "- Arrow is a 2.5-size square rotated 45 degrees with matching `bg-foreground fill-foreground`",
          "- Default `sideOffset` is `0`; content uses `text-balance` for wrapping",
          "- When `TooltipShortcut` is present, content gets `pr-1.5` via `has-[[data-slot=tooltip-shortcut]]:pr-1.5`",
          "- Uses `data-slot` attributes: `tooltip-provider`, `tooltip`, `tooltip-trigger`, `tooltip-content`, `tooltip-shortcut`",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Passe o mouse</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Esta é uma dica</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Passe o mouse" });
    await expect(trigger).toBeInTheDocument();

    await userEvent.hover(trigger);

    await new Promise((r) => setTimeout(r, 300));
    const tooltipContent = document.querySelector('[data-slot="tooltip-content"]');
    await expect(tooltipContent).toBeInTheDocument();
    await expect(tooltipContent!.querySelector(':scope > p')?.textContent).toBe("Esta é uma dica");
  },
};

export const WithShortcut: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Salvar</Button>
      </TooltipTrigger>
      <TooltipContent>
        Salvar documento
        <TooltipShortcut>⌘S</TooltipShortcut>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Salvar" });
    await expect(trigger).toBeInTheDocument();

    await userEvent.hover(trigger);

    await new Promise((r) => setTimeout(r, 300));
    const tooltipContent = document.querySelector('[data-slot="tooltip-content"]');
    await expect(tooltipContent).toBeInTheDocument();
    await expect(tooltipContent!.textContent).toContain("Salvar documento");
    await expect(tooltipContent!.querySelector('[data-slot="tooltip-shortcut"]')?.textContent).toBe("⌘S");
  },
};

export const Positions: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-16">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Dica superior</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Direita</Button>
        </TooltipTrigger>
        <TooltipContent side="right">Dica direita</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Inferior</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Dica inferior</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Esquerda</Button>
        </TooltipTrigger>
        <TooltipContent side="left">Dica esquerda</TooltipContent>
      </Tooltip>
    </div>
  ),
};
