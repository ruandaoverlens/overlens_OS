import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Slider } from "./slider";

const meta = {
  title: "Base Components/Slider",
  tags: ["autodocs"],
  component: Slider,
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    onValueChange: { control: false },
    onValueCommit: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Range slider built on Radix Slider primitive, supporting single and multi-thumb configurations with horizontal or vertical orientation.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Slider defaultValue={[50]} max={100} step={1} />",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `defaultValue` | `number[]` | `[min, max]` | Initial uncontrolled value(s); array length determines number of thumbs |",
          "| `value` | `number[]` | - | Controlled value(s) |",
          "| `min` | `number` | `0` | Minimum value |",
          "| `max` | `number` | `100` | Maximum value |",
          "| `step` | `number` | `1` | Step increment |",
          "| `orientation` | `\"horizontal\"` \\| `\"vertical\"` | `\"horizontal\"` | Slider direction |",
          "| `disabled` | `boolean` | `false` | Disables the slider (opacity 20%) |",
          "| `onValueChange` | `(value: number[]) => void` | - | Fires on every value change |",
          "| `onValueCommit` | `(value: number[]) => void` | - | Fires when interaction ends |",
          "",
          "## Key details",
          "",
          "- Uses `data-slot=\"slider\"`, `data-slot=\"slider-track\"`, `data-slot=\"slider-range\"`, and `data-slot=\"slider-thumb\"` for styling hooks.",
          "- Track is `bg-muted` with `h-1.5` (horizontal) or `w-1.5` (vertical); range fill uses `bg-primary`.",
          "- Thumb is a `size-4` circle with `border-foreground`, `bg-white`, and a `ring-foreground/50` hover/focus ring.",
          "- Multiple thumbs are rendered automatically based on the length of the `value` or `defaultValue` array.",
          "- Vertical orientation sets `min-h-44` and switches to column flex layout.",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] py-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: [50], max: 100, step: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = await canvas.findByRole("slider");

    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute("aria-valuemin", "0");
    await expect(slider).toHaveAttribute("aria-valuemax", "100");
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
  },
};

export const Range: Story = {
  args: { defaultValue: [25, 75], max: 100, step: 1 },
};

export const Disabled: Story = {
  args: { defaultValue: [50], max: 100, step: 1, disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = await canvas.findByRole("slider");

    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute("data-disabled", "");
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[300px]">
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Padrão</span>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Intervalo</span>
        <Slider defaultValue={[25, 75]} max={100} step={1} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Desabilitado</span>
        <Slider defaultValue={[50]} max={100} step={1} disabled />
      </div>
    </div>
  ),
};
