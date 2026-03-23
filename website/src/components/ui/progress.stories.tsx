import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Progress } from "./progress";

const meta = {
  title: "Base Components/Progress",
  tags: ["autodocs"],
  component: Progress,
  decorators: [
    (Story) => (
      <div className="w-[400px] py-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Horizontal progress bar indicating completion percentage, built on Radix UI Progress primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Progress value={50} />",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `value` | `number \\| null` | `null` | Current progress value (0-100) |",
          "| `max` | `number` | `100` | Maximum value (from Radix) |",
          "| `className` | `string` | -- | Additional CSS classes for the root track |",
          "",
          "## Key details",
          "",
          "- Root track uses `bg-accent h-2 rounded-full overflow-hidden` (`data-slot=\"progress\"`).",
          "- Indicator uses `bg-primary` with `translateX(-${100 - value}%)` transform for fill animation (`data-slot=\"progress-indicator\"`).",
          "- Radix sets `role=\"progressbar\"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` automatically.",
          "- Height can be customized via className (e.g., `h-1`, `h-3`, `h-4`).",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 33 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeInTheDocument();

    // Verify aria attributes set by Radix
    await expect(progressbar).toHaveAttribute("aria-valuenow", "33");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");

    // Verify the progress indicator is present
    await expect(progressbar).toHaveAttribute("data-slot", "progress");
  },
};

export const Halfway: Story = {
  args: { value: 50 },
};

export const Complete: Story = {
  args: { value: 100 },
};

export const WithLabel: Story = {
  render: () => {
    const steps = [
      { label: "Upload do arquivo", value: 100 },
      { label: "Processamento", value: 65 },
      { label: "Verificação final", value: 0 },
    ];

    return (
      <div className="flex flex-col gap-6 w-[400px]">
        {steps.map((step) => (
          <div key={step.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{step.label}</span>
              <span className="text-sm text-muted-foreground">{step.value}%</span>
            </div>
            <Progress value={step.value} />
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Upload do arquivo")).toBeInTheDocument();
    await expect(canvas.getByText("Processamento")).toBeInTheDocument();
    await expect(canvas.getByText("Verificação final")).toBeInTheDocument();

    const progressBars = canvas.getAllByRole("progressbar");
    await expect(progressBars.length).toBe(3);

    await expect(progressBars[0]).toHaveAttribute("aria-valuenow", "100");
    await expect(progressBars[1]).toHaveAttribute("aria-valuenow", "65");
    await expect(progressBars[2]).toHaveAttribute("aria-valuenow", "0");
  },
};

export const CustomSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px]">
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Fino (h-1)</span>
        <Progress value={60} className="h-1" />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Padrão (h-2)</span>
        <Progress value={60} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Médio (h-3)</span>
        <Progress value={60} className="h-3" />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">Grande (h-4)</span>
        <Progress value={60} className="h-4" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">0%</span>
        <Progress value={0} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">25%</span>
        <Progress value={25} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">50%</span>
        <Progress value={50} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">75%</span>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <span className="text-sm text-muted-foreground">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
};
