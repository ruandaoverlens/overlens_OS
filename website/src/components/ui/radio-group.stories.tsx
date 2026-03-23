import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

const meta = {
  title: "Base Components/RadioGroup",
  tags: ["autodocs"],
  component: RadioGroup,
  argTypes: {
    disabled: { control: "boolean" },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Radio button group for mutually exclusive selection, built on Radix UI RadioGroup primitive with CVA size variants.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<RadioGroup defaultValue=\"option-1\">",
          "  <div className=\"flex items-center space-x-1\">",
          "    <RadioGroupItem value=\"option-1\" id=\"option-1\" />",
          "    <Label htmlFor=\"option-1\">Option 1</Label>",
          "  </div>",
          "  <div className=\"flex items-center space-x-1\">",
          "    <RadioGroupItem value=\"option-2\" id=\"option-2\" />",
          "    <Label htmlFor=\"option-2\">Option 2</Label>",
          "  </div>",
          "</RadioGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `RadioGroup` | Root container wrapping `RadioGroup.Root` (`data-slot=\"radio-group\"`). Uses `grid gap-3` layout. Supports `defaultValue`, `value`, `onValueChange`, `disabled`, and `orientation` props from Radix. |",
          "| `RadioGroupItem` | Individual radio button wrapping `RadioGroup.Item` (`data-slot=\"radio-group-item\"`). Renders a filled circle indicator (`data-slot=\"radio-group-indicator\"`) using `bg-foreground` dot. Supports CVA `size` prop. |",
          "",
          "## Props (RadioGroupItem)",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `size` | `\"sm\"` \\| `\"default\"` \\| `\"lg\"` | `\"default\"` | Size variant: `sm` = 20px, `default` = 24px, `lg` = 32px |",
          "| `value` | `string` | -- | Value submitted when selected |",
          "| `disabled` | `boolean` | `false` | Disables the radio item (opacity 20%) |",
          "",
          "## Key details",
          "",
          "- Three sizes via CVA: `sm` (size-5, dot size-3), `default` (size-6, dot size-4), `lg` (size-8, dot size-5).",
          "- Border uses `border-2 border-foreground` with `hover:border-primary` and `focus-visible:ring-2 ring-primary`.",
          "- Invalid state styled via `aria-invalid:border-destructive` and destructive ring.",
          "- Disabled items use `opacity-20` and `pointer-events-none`.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "option-1",
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Opção 1</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">Opção 2</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Opção 3</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = await canvas.findAllByRole("radio");

    await expect(radios[0]).toBeChecked();
    await expect(radios[1]).not.toBeChecked();

    await userEvent.click(radios[1]);

    await expect(radios[1]).toBeChecked();
    await expect(radios[0]).not.toBeChecked();
  },
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="option-1" id="d-option-1" disabled />
        <Label htmlFor="d-option-1">Desativado selecionado</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="option-2" id="d-option-2" disabled />
        <Label htmlFor="d-option-2">Desativado não selecionado</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="card" className="flex gap-4">
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="card" id="card" />
        <Label htmlFor="card">Card</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="paypal" id="paypal" />
        <Label htmlFor="paypal">PayPal</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="apple" id="apple" />
        <Label htmlFor="apple">Apple Pay</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = await canvas.findAllByRole("radio");

    // "card" is selected by default
    await expect(radios[0]).toBeChecked();
    await expect(radios[1]).not.toBeChecked();

    // Click PayPal (second option)
    await userEvent.click(radios[1]);
    await expect(radios[1]).toBeChecked();
    await expect(radios[0]).not.toBeChecked();
  },
};

export const Invalid: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="option-1" id="inv-1" aria-invalid="true" />
        <Label htmlFor="inv-1">Este campo é obrigatório</Label>
      </div>
    </RadioGroup>
  ),
};

export const AllSizes: Story = {
  name: "Radio - All Sizes",
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Tiny (sm) - 20px</span>
        <div className="flex items-center gap-4">
          <RadioGroup defaultValue="checked" className="flex gap-4">
            <RadioGroupItem size="sm" value="unchecked-sm" aria-label="unchecked" />
            <RadioGroupItem size="sm" value="checked" aria-label="checked" />
          </RadioGroup>
          <RadioGroup className="flex gap-4">
            <RadioGroupItem size="sm" value="disabled-empty" disabled aria-label="disabled" />
          </RadioGroup>
          <RadioGroup defaultValue="disabled-filled" className="flex gap-4">
            <RadioGroupItem size="sm" value="disabled-filled" disabled aria-label="disabled checked" />
          </RadioGroup>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Mini (default) - 24px</span>
        <div className="flex items-center gap-4">
          <RadioGroup defaultValue="checked" className="flex gap-4">
            <RadioGroupItem value="unchecked-default" aria-label="unchecked" />
            <RadioGroupItem value="checked" aria-label="checked" />
          </RadioGroup>
          <RadioGroup className="flex gap-4">
            <RadioGroupItem value="disabled-empty" disabled aria-label="disabled" />
          </RadioGroup>
          <RadioGroup defaultValue="disabled-filled" className="flex gap-4">
            <RadioGroupItem value="disabled-filled" disabled aria-label="disabled checked" />
          </RadioGroup>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Small (lg) - 32px</span>
        <div className="flex items-center gap-4">
          <RadioGroup defaultValue="checked" className="flex gap-4">
            <RadioGroupItem size="lg" value="unchecked-lg" aria-label="unchecked" />
            <RadioGroupItem size="lg" value="checked" aria-label="checked" />
          </RadioGroup>
          <RadioGroup className="flex gap-4">
            <RadioGroupItem size="lg" value="disabled-empty" disabled aria-label="disabled" />
          </RadioGroup>
          <RadioGroup defaultValue="disabled-filled" className="flex gap-4">
            <RadioGroupItem size="lg" value="disabled-filled" disabled aria-label="disabled checked" />
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable" className="w-[300px]">
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Padrão</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Confortável</Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compacto</Label>
      </div>
    </RadioGroup>
  ),
};
