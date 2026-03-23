import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./switch";
import { Label } from "./label";

const meta = {
  title: "Base Components/Switch",
  tags: ["autodocs"],
  component: Switch,
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["default", "sm"] },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Toggle switch for binary on/off settings, built on Radix Switch primitive. Available in default and small sizes.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Switch id=\"setting\" size=\"default\" />",
          "<Label htmlFor=\"setting\">Label</Label>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `size` | `\"default\"` \\| `\"sm\"` | `\"default\"` | Switch size variant |",
          "| `disabled` | `boolean` | `false` | Disables interaction (opacity 20%) |",
          "| `defaultChecked` | `boolean` | `false` | Initial uncontrolled checked state |",
          "| `checked` | `boolean` | - | Controlled checked state |",
          "| `onCheckedChange` | `(checked: boolean) => void` | - | Callback when toggled |",
          "",
          "## Key details",
          "",
          "- Uses `data-slot=\"switch\"` and `data-slot=\"switch-thumb\"` for styling hooks, plus `data-size` for size variants.",
          "- Default size: `h-[1.15rem] w-8` track, `size-4` thumb. Small: `h-3.5 w-6` track, `size-3` thumb.",
          "- Checked state uses `bg-primary` track with `outline-white`; unchecked uses `bg-input` with `outline-input`.",
          "- Thumb slides via `translate-x` transform; in dark mode unchecked thumb uses `bg-foreground`, checked uses `bg-primary-foreground`.",
          "- Focus ring uses `focus-visible:ring-2 ring-foreground`.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Alternar funcionalidade" },
};

export const Checked: Story = {
  args: { defaultChecked: true, "aria-label": "Alternar funcionalidade" },
};

export const Disabled: Story = {
  args: { disabled: true, "aria-label": "Alternar funcionalidade" },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true, "aria-label": "Alternar funcionalidade" },
};

export const Small: Story = {
  args: { size: "sm", "aria-label": "Alternar funcionalidade" },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Modo avião</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = await canvas.findByRole("switch");

    await expect(switchEl).not.toBeChecked();

    await userEvent.click(switchEl);
    await expect(switchEl).toBeChecked();

    await userEvent.click(switchEl);
    await expect(switchEl).not.toBeChecked();
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      {[
        { id: "notifications", label: "Ativar notificações" },
        { id: "marketing", label: "E-mails de marketing" },
        { id: "analytics", label: "Análise de uso" },
      ].map(({ id, label }) => (
        <div key={id} className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
          <Switch id={id} />
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["default", "sm"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Switch size={size} aria-label={`Tamanho ${size}`} />
          <span className="text-sm text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};
