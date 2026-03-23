import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ChevronsUpDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Button } from "./button";

const meta = {
  title: "Core Components/Collapsible",
  tags: ["autodocs"],
  component: Collapsible,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Interactive disclosure widget that toggles the visibility of a content section. Built on Radix UI Collapsible primitive.",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `open` | `boolean` | - | Controlled open state |",
          "| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |",
          "| `onOpenChange` | `(open: boolean) => void` | - | Callback fired on open/close |",
          "| `disabled` | `boolean` | `false` | Prevents toggling when `true` |",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Collapsible>",
          "  <CollapsibleTrigger>Toggle</CollapsibleTrigger>",
          "  <CollapsibleContent>Hidden content</CollapsibleContent>",
          "</Collapsible>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Component | Role | Notes |",
          "|-----------|------|-------|",
          "| `Collapsible` | Root container | Manages open/closed state, `w-full` on mobile, `w-[380px]` on `sm+`. Supports `data-slot=\"collapsible\"` |",
          "| `CollapsibleTrigger` | Toggle button | Supports `asChild` to render as a custom element (e.g. `<Button>`) |",
          "| `CollapsibleContent` | Expandable area | Removed from DOM when collapsed (Radix default) |",
          "",
          "## Key details",
          "",
          "- WAI-ARIA compliant - trigger uses `aria-expanded` and controls the content region",
          "- Supports controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) modes",
          "- Responsive width: fills container on mobile (`w-full`), fixed `380px` on `sm+` breakpoint (overridable via `className`)",
          "- Content is unmounted from the DOM when collapsed, not just hidden - use `forceMount` on `CollapsibleContent` if you need persistent DOM presence",
          "- `CollapsibleTrigger` supports `asChild` to compose with any interactive element",
          "- Nestable - collapsibles can be placed inside other collapsibles for tree/hierarchy patterns",
          "- `disabled` prop on root prevents all toggling and propagates disabled state to trigger",
          "- No built-in animation - add CSS transitions on `CollapsibleContent` via `data-state=\"open\"` / `data-state=\"closed\"` attributes",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controlled open state of the collapsible",
    },
    defaultOpen: {
      control: "boolean",
      description: "Initial open state (uncontrolled)",
    },
    onOpenChange: {
      control: false,
      description: "Callback fired when the collapsible opens or closes",
    },
    disabled: {
      control: "boolean",
      description: "Prevents toggling when true",
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Collapsible {...args} className="space-y-1">
      <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
        <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-lg border px-4 py-3 text-sm">@radix-ui/primitives</div>
      <CollapsibleContent className="space-y-1">
        <div className="rounded-lg border px-4 py-3 text-sm">@radix-ui/colors</div>
        <div className="rounded-lg border px-4 py-3 text-sm">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger).toBeInTheDocument();

    // Content not in DOM when collapsed (Radix removes it)
    await expect(canvas.queryByText("@radix-ui/colors")).not.toBeInTheDocument();

    await userEvent.click(trigger);

    await expect(await canvas.findByText("@radix-ui/colors")).toBeVisible();
    await expect(canvas.getByText("@stitches/react")).toBeVisible();
  },
};

export const Open: Story = {
  render: () => (
    <Collapsible defaultOpen className="space-y-1">
      <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
        <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-lg border px-4 py-3 text-sm">@radix-ui/primitives</div>
      <CollapsibleContent className="space-y-1">
        <div className="rounded-lg border px-4 py-3 text-sm">@radix-ui/colors</div>
        <div className="rounded-lg border px-4 py-3 text-sm">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");

    // Content should be visible by default (defaultOpen)
    await expect(canvas.getByText("@radix-ui/colors")).toBeVisible();

    // Click to collapse - Radix removes content from DOM
    await userEvent.click(trigger);
    await expect(canvas.queryByText("@radix-ui/colors")).not.toBeInTheDocument();
  },
};

export const Nested: Story = {
  render: () => (
    <Collapsible className="space-y-1">
      <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
        <h4 className="text-sm font-semibold">Categories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-1">
        <div className="rounded-lg border px-4 py-3 text-sm">Frontend</div>
        <Collapsible className="pl-4 sm:w-full space-y-1">
          <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
            <h4 className="text-sm font-semibold">UI Libraries</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-1">
            <div className="rounded-lg border px-4 py-3 text-sm">Radix UI</div>
            <div className="rounded-lg border px-4 py-3 text-sm">shadcn/ui</div>
          </CollapsibleContent>
        </Collapsible>
        <div className="rounded-lg border px-4 py-3 text-sm">Backend</div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole("button");

    // Open outer collapsible
    await userEvent.click(triggers[0]);
    await expect(await canvas.findByText("Frontend")).toBeVisible();
    await expect(canvas.getByText("Backend")).toBeVisible();

    // Open inner collapsible (nested)
    const innerTrigger = canvas.getAllByRole("button")[1];
    await userEvent.click(innerTrigger);
    await expect(await canvas.findByText("Radix UI")).toBeVisible();
    await expect(canvas.getByText("shadcn/ui")).toBeVisible();
  },
};

export const Disabled: Story = {
  render: () => (
    <Collapsible disabled className="space-y-1">
      <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
        <h4 className="text-sm font-semibold text-muted-foreground">Unavailable section</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" disabled aria-label="Toggle">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        Always visible content
      </div>
      <CollapsibleContent className="space-y-1">
        <div className="rounded-lg border px-4 py-3 text-sm">This content is hidden</div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger).toBeDisabled();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full flex-col items-start gap-8 sm:flex-row sm:flex-wrap">
      {/* Collapsed (default) */}
      <Collapsible className="space-y-1">
        <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
          <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-lg border px-4 py-3 text-sm">@radix-ui/primitives</div>
        <CollapsibleContent className="space-y-1">
          <div className="rounded-lg border px-4 py-3 text-sm">@radix-ui/colors</div>
          <div className="rounded-lg border px-4 py-3 text-sm">@stitches/react</div>
        </CollapsibleContent>
      </Collapsible>

      {/* Open by default */}
      <Collapsible defaultOpen className="space-y-1">
        <div className="flex items-center justify-between space-x-4 pl-2 mb-1">
          <h4 className="text-sm font-semibold">Details</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-1">
          <div className="rounded-lg border px-4 py-3 text-sm">Content visible by default</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
