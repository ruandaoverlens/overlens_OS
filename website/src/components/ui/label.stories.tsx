import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Label } from "./label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { SmMailSolidIcon, SmProfileLineIcon } from "@/components/icons";

const meta = {
  title: "Base Components/Label",
  tags: ["autodocs"],
  component: Label,
  parameters: {
    docs: {
      description: {
        component: [
          "Accessible label component for form controls, built on the Radix `Label` primitive.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Label htmlFor=\"email\">E-mail</Label>",
          "<Input id=\"email\" />",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `htmlFor` | `string` | - | Associates the label with a form control by ID |",
          "| `children` | `ReactNode` | - | Label text content |",
          "| `className` | `string` | - | Additional CSS classes |",
          "",
          "## Key details",
          "",
          "- Built on `Radix Label.Root` for accessible form association",
          "- Uses `font-body` (Inter) with `text-sm font-medium` and `pl-2` left padding",
          "- Includes `select-none` to prevent text selection on click",
          "- Disabled state is inherited from a parent `group-data-[disabled=true]` container, applying `pointer-events-none` and `opacity-50`",
          "- Also supports the `peer-disabled` pattern for sibling disabled inputs with `cursor-not-allowed` and `opacity-50`",
          "- Uses `data-slot=\"label\"` for styling hooks",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: { control: "text" },
    htmlFor: { control: "text" },
    className: { control: "text" },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "E-mail" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const label = canvas.getByText("E-mail");
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveAttribute("data-slot", "label");
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-[300px] gap-1.5">
      <Label htmlFor="email">E-mail</Label>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
        <InputGroupInput id="email" type="email" placeholder="nome@exemplo.com" />
      </InputGroup>
    </div>
  ),
};

export const Required: Story = {
  name: "Obrigatório",
  render: () => (
    <div className="grid w-[300px] gap-1.5">
      <Label htmlFor="required-name">
        Nome <span className="text-destructive">*</span>
      </Label>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
        <InputGroupInput id="required-name" required placeholder="Digite seu nome" />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("*")).toBeInTheDocument();

    const input = canvas.getByPlaceholderText("Digite seu nome");
    await expect(input).toBeRequired();
  },
};

export const Disabled: Story = {
  name: "Desabilitado",
  render: () => (
    <div className="grid w-[300px] gap-1.5" data-disabled="true">
      <Label htmlFor="disabled-field">Campo indisponível</Label>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
        <InputGroupInput id="disabled-field" disabled placeholder="Indisponível" />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Indisponível");
    await expect(input).toBeDisabled();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {/* Padrao */}
      <Label>E-mail</Label>

      {/* Com input */}
      <div className="grid w-[200px] gap-1.5">
        <Label htmlFor="all-email">E-mail</Label>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
          <InputGroupInput id="all-email" type="email" placeholder="nome@exemplo.com" />
        </InputGroup>
      </div>

      {/* Desabilitado */}
      <div className="grid w-[200px] gap-1.5" data-disabled="true">
        <Label>Desabilitado</Label>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput disabled placeholder="Indisponivel" />
        </InputGroup>
      </div>

      {/* Obrigatorio */}
      <div className="grid w-[200px] gap-1.5">
        <Label htmlFor="all-required">
          Nome <span className="text-destructive">*</span>
        </Label>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput id="all-required" required placeholder="Obrigatorio" />
        </InputGroup>
      </div>
    </div>
  ),
};
