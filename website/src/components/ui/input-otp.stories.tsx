import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./input-otp";

const meta = {
  title: "Base Components/InputOTP",
  tags: ["autodocs"],
  component: InputOTP,
  parameters: {
    docs: {
      description: {
        component: [
          "One-time password input with configurable slot count and pattern validation, built on the `input-otp` library.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<InputOTP maxLength={6}>",
          "  <InputOTPGroup>",
          "    <InputOTPSlot index={0} />",
          "    <InputOTPSlot index={1} />",
          "    <InputOTPSlot index={2} />",
          "  </InputOTPGroup>",
          "  <InputOTPSeparator />",
          "  <InputOTPGroup>",
          "    <InputOTPSlot index={3} />",
          "    <InputOTPSlot index={4} />",
          "    <InputOTPSlot index={5} />",
          "  </InputOTPGroup>",
          "</InputOTP>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `InputOTP` | Root wrapper around `OTPInput`. Accepts `containerClassName` for the flex container and all `OTPInput` props (`maxLength`, `pattern`, `onComplete`, etc.). Uses `data-slot=\"input-otp\"`. |",
          "| `InputOTPGroup` | Groups adjacent slots visually with `flex items-center`. Uses `data-slot=\"input-otp-group\"`. |",
          "| `InputOTPSlot` | Individual character cell. Requires `index` prop to read slot state (`char`, `hasFakeCaret`, `isActive`) from `OTPInputContext`. Active slot gets `data-active=\"true\"` with a foreground border and z-index bump. Uses `data-slot=\"input-otp-slot\"`. |",
          "| `InputOTPSeparator` | Dash separator between groups, renders `SmMinusLineIcon`. Uses `role=\"separator\"` and `data-slot=\"input-otp-separator\"`. |",
          "",
          "## Key details",
          "",
          "- Slot dimensions are `h-9 w-9` with `rounded-l-lg` / `rounded-r-lg` on first/last slots and negative left margin (`-ml-px`) for shared borders",
          "- Active slot shows a blinking caret via the `animate-caret-blink` animation class",
          "- Disabled state uses `has-disabled:opacity-50` on the container and `disabled:cursor-not-allowed` on the input",
          "- Supports `aria-invalid` styling with `border-destructive` for validation errors",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    maxLength: { control: "number" },
    disabled: { control: "boolean" },
    onChange: { control: false },
    onComplete: { control: false },
  },
} satisfies Meta;

export default meta;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    maxLength: 4,
  },
  render: (args) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <InputOTP {...(args as any)}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slots = canvasElement.querySelectorAll('[data-slot="input-otp-slot"]');
    await expect(slots.length).toBe(4);

    // Click the actual hidden input, not the visual slots (which have pointer-events: none)
    const otpInput = canvasElement.querySelector<HTMLInputElement>('[data-slot="input-otp"] input, input[data-input-otp="true"]')
      ?? canvasElement.querySelector<HTMLInputElement>('[data-slot="input-otp"]');
    await expect(otpInput).toBeInTheDocument();
    otpInput!.focus();
    await userEvent.keyboard("1234");

    await expect(canvas.getByText("1")).toBeInTheDocument();
    await expect(canvas.getByText("2")).toBeInTheDocument();
    await expect(canvas.getByText("3")).toBeInTheDocument();
    await expect(canvas.getByText("4")).toBeInTheDocument();
  },
};

export const WithSeparator: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const SixDigit: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slots = canvasElement.querySelectorAll('[data-slot="input-otp-slot"]');
    await expect(slots.length).toBe(6);

    // Focus the actual input instead of clicking slots (pointer-events: none)
    const otpInput = canvasElement.querySelector<HTMLInputElement>('[data-slot="input-otp"] input, input[data-input-otp="true"]')
      ?? canvasElement.querySelector<HTMLInputElement>('[data-slot="input-otp"]');
    otpInput!.focus();
    await userEvent.keyboard("987654");

    await expect(canvas.getByText("9")).toBeInTheDocument();
    await expect(canvas.getByText("8")).toBeInTheDocument();
    await expect(canvas.getByText("7")).toBeInTheDocument();
    await expect(canvas.getByText("6")).toBeInTheDocument();
    await expect(canvas.getByText("5")).toBeInTheDocument();
    await expect(canvas.getByText("4")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium mb-2">4 dígitos</p>
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">6 dígitos</p>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Com separador</p>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  ),
};
