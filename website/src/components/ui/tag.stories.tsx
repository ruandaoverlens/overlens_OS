import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Tag } from "./tag";

const meta = {
  title: "Base Components/Tag",
  tags: ["autodocs"],
  component: Tag,
  argTypes: {
    small: { control: "boolean" },
    disabled: { control: "boolean" },
    onDismiss: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Compact label chip with optional dismiss button, useful for filters, categories, or multi-select values. Rendered as a `<span>` with monospace uppercase text.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Tag>Label</Tag>",
          "<Tag small>Small label</Tag>",
          "<Tag onDismiss={() => {}}>Dismissible</Tag>",
          "<Tag disabled>Disabled</Tag>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `small` | `boolean` | `false` | Uses `text-xs` and reduced padding (`px-2 py-0.5`) instead of `text-sm` with `px-2 py-1` |",
          "| `disabled` | `boolean` | `false` | Sets `data-disabled`, `aria-disabled`, `pointer-events-none`, and `opacity-20` |",
          "| `onDismiss` | `() => void` | - | When provided, renders a dismiss button with `SmCloseLineIcon` and `aria-label=\"Remove\"` |",
          "",
          "## Key details",
          "",
          "- Uses `font-mono uppercase` for label text with `rounded-[4px]` corners",
          "- Background: `dark:bg-[var(--surface-200)]/10`, hover: `dark:bg-white/20`, active: `dark:bg-white/30`",
          "- Text color: `dark:text-[var(--surface-300)]`",
          "- Focus ring: `ring-2 ring-[var(--surface-200)]`",
          "- Dismiss button uses `e.stopPropagation()` to prevent parent click handlers from firing",
          "- Uses `data-slot=\"tag\"` attribute",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDismiss = fn();

export const Default: Story = {
  args: { children: "Nexialista", onDismiss: mockDismiss },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Nexialista")).toBeInTheDocument();

    const removeButton = canvas.getByRole("button", { name: "Remove" });
    await expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);
    await expect(mockDismiss).toHaveBeenCalledTimes(1);
  },
};

export const WithDismiss: Story = {
  args: { children: "Nexialista", onDismiss: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Nexialista")).toBeInTheDocument();

    const removeButton = canvas.getByRole("button", { name: "Remove" });
    await userEvent.click(removeButton);
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

export const SmallSize: Story = {
  args: { children: "Nexialista", small: true },
};

export const SmallWithDismiss: Story = {
  args: { children: "Nexialista", small: true, onDismiss: fn() },
};

export const Disabled: Story = {
  args: { children: "Nexialista", disabled: true },
};

export const AllStates: Story = {
  name: "Tag - All States & Sizes",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Mini (default) - 14px, Medium</span>
        <div className="flex items-center gap-3">
          <Tag>Default</Tag>
          <Tag onDismiss={fn()}>Dismissible</Tag>
          <Tag disabled>Disabled</Tag>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Tiny (sm) - 12px, Bold</span>
        <div className="flex items-center gap-3">
          <Tag small>Default</Tag>
          <Tag small onDismiss={fn()}>Dismissible</Tag>
          <Tag small disabled>Disabled</Tag>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Multiple tags</span>
        <div className="flex flex-wrap items-center gap-2">
          <Tag onDismiss={fn()}>React</Tag>
          <Tag onDismiss={fn()}>TypeScript</Tag>
          <Tag onDismiss={fn()}>Tailwind</Tag>
          <Tag onDismiss={fn()}>Next.js</Tag>
          <Tag onDismiss={fn()}>Figma</Tag>
        </div>
      </div>
    </div>
  ),
};
