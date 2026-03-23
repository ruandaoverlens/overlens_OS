import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "Base Components/Checkbox",
  tags: ["autodocs"],
  component: Checkbox,
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Checkbox form control built on Radix `Checkbox` primitive. Supports checked, unchecked, and indeterminate states with three size options.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<div className=\"flex items-center gap-1\">",
          "  <Checkbox id=\"terms\" size=\"default\" />",
          "  <Label htmlFor=\"terms\">Accept terms</Label>",
          "</div>",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `size` | `\"sm\" \\| \"default\" \\| \"lg\"` | `\"default\"` | Checkbox size: `sm` (20px), `default` (24px), `lg` (32px) |",
          "| `checked` | `boolean \\| \"indeterminate\"` | - | Controlled checked state |",
          "| `defaultChecked` | `boolean` | - | Uncontrolled initial checked state |",
          "| `disabled` | `boolean` | `false` | Disables the checkbox with `opacity-20` |",
          "",
          "## Key details",
          "",
          "- Renders `data-slot=\"checkbox\"` with a nested `data-slot=\"checkbox-indicator\"`",
          "- Uses `SmCheckLineIcon` as the check indicator, sized per variant (`size-3`, `size-4`, `size-5`)",
          "- Checked state fills with `bg-foreground` and `text-background`; indeterminate shows border only with `text-foreground`",
          "- Hover changes border color to `border-primary`; focus ring uses `ring-2 ring-primary`",
          "- All sizes use `rounded-[6px]` except `lg` which uses `rounded-lg`",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Accept terms" },
};

export const Checked: Story = {
  args: { defaultChecked: true, "aria-label": "Accept terms" },
};

export const Indeterminate: Story = {
  args: { checked: "indeterminate", "aria-label": "Select all" },
};

export const Disabled: Story = {
  args: { disabled: true, "aria-label": "Accept terms" },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true, "aria-label": "Accept terms" },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Aceitar termos e condições</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = await canvas.findByRole("checkbox");

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const Invalid: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Checkbox id="required" aria-invalid="true" />
      <Label htmlFor="required">Este campo é obrigatório</Label>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "Checkbox - All Sizes",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Tiny (sm) - 20px</span>
        <div className="flex items-center gap-4">
          <Checkbox size="sm" aria-label="unchecked" />
          <Checkbox size="sm" defaultChecked aria-label="checked" />
          <Checkbox size="sm" checked="indeterminate" aria-label="indeterminate" />
          <Checkbox size="sm" disabled aria-label="disabled" />
          <Checkbox size="sm" disabled defaultChecked aria-label="disabled checked" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Mini (default) - 24px</span>
        <div className="flex items-center gap-4">
          <Checkbox aria-label="unchecked" />
          <Checkbox defaultChecked aria-label="checked" />
          <Checkbox checked="indeterminate" aria-label="indeterminate" />
          <Checkbox disabled aria-label="disabled" />
          <Checkbox disabled defaultChecked aria-label="disabled checked" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Small (lg) - 32px</span>
        <div className="flex items-center gap-4">
          <Checkbox size="lg" aria-label="unchecked" />
          <Checkbox size="lg" defaultChecked aria-label="checked" />
          <Checkbox size="lg" checked="indeterminate" aria-label="indeterminate" />
          <Checkbox size="lg" disabled aria-label="disabled" />
          <Checkbox size="lg" disabled defaultChecked aria-label="disabled checked" />
        </div>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-3 w-[300px]">
      {[
        { id: "email-notif", label: "Email notifications" },
        { id: "sms-notif", label: "SMS notifications" },
        { id: "push-notif", label: "Push notifications" },
      ].map(({ id, label }) => (
        <div key={id} className="flex items-center gap-1">
          <Checkbox id={id} />
          <Label htmlFor={id}>{label}</Label>
        </div>
      ))}
    </div>
  ),
};
