import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "./input";
import type { VariantProps } from "class-variance-authority";
import type { inputVariants } from "./input";
import { Label } from "./label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Kbd } from "./kbd";
import {
  SmMailSolidIcon,
  SmLockSolidIcon,
  SmVisibilitySolidIcon,
  SmVisibilityOffSolidIcon,
  SmSearchLineIcon,
  SmProfileLineIcon,
  SmInfoLineIcon,
  SmUploadLineIcon,
} from "@/components/icons";

type InputSize = VariantProps<typeof inputVariants>["size"];

const meta = {
  title: "Base Components/Input",
  tags: ["autodocs"],
  component: Input,
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
    size: {
      control: "select",
      options: ["lg", "md", "default", "sm", "xs"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    onChange: { control: false },
    onFocus: { control: false },
    onBlur: { control: false },
  },
  args: {
    type: "text",
    size: "default",
    placeholder: "Digite seu nome aqui",
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Text input field with multiple size variants and consistent focus/hover/invalid styling. Uses CVA for size variants.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Input size=\"default\" type=\"text\" placeholder=\"...\" />",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `size` | `\"lg\"` \\| `\"md\"` \\| `\"default\"` \\| `\"sm\"` \\| `\"xs\"` | `\"default\"` | Controls height and border radius. `lg`=80px, `md`=64px, `default`=48px, `sm`=40px, `xs`=32px |",
          "| `type` | `string` | - | Standard HTML input type |",
          "| `className` | `string` | - | Additional CSS classes |",
          "",
          "## Key details",
          "",
          "- Uses `data-slot=\"input\"` and `data-size` attributes for styling hooks",
          "- Background: `bg-accent/50 dark:bg-input/30` with hover state `hover:bg-accent dark:hover:bg-input/50`",
          "- Focus: `focus-visible:border-input focus-visible:bg-transparent` with transparent 2px border",
          "- Invalid state: `aria-invalid` triggers `ring-destructive` ring and red border, cleared on focus",
          "- File input styling: inline-flex with transparent background and medium font",
          "- Autofill: overrides browser background with `oklch(0.21 0 0)` (matches `dark:bg-input/30` on black) and preserves `--color-foreground` text color via `-webkit-text-fill-color`",
          "- Exports both `Input` component and `inputVariants` CVA definition for reuse",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InputGroup size={args.size} className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon align="inline-start">
        <SmProfileLineIcon />
      </InputGroupAddon>
      <InputGroupInput
        type={args.type}
        placeholder={args.placeholder}
        disabled={args.disabled}
      />
      <InputGroupAddon align="inline-end">
        <SmInfoLineIcon className="text-[var(--surface-600)]" />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByPlaceholderText("Digite seu nome aqui");

    await expect(input).toBeVisible();

    await userEvent.clear(input);
    await userEvent.type(input, "João Silva");

    await expect(input).toHaveValue("João Silva");
  },
};

export const Email: Story = {
  args: { placeholder: "nome@exemplo.com" },
  render: (args) => (
    <InputGroup size={args.size} className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon align="inline-start">
        <SmMailSolidIcon />
      </InputGroupAddon>
      <InputGroupInput type="email" placeholder={args.placeholder} disabled={args.disabled} />
    </InputGroup>
  ),
};

function PasswordToggle({ size, disabled }: { size?: InputSize; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup size={size} className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon align="inline-start">
        <SmLockSolidIcon />
      </InputGroupAddon>
      <InputGroupInput
        type={visible ? "text" : "password"}
        placeholder="Digite sua senha"
        disabled={disabled}
      />
      <button
        type="button"
        className="mr-3 cursor-pointer text-[var(--surface-600)]"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? <SmVisibilityOffSolidIcon /> : <SmVisibilitySolidIcon />}
      </button>
    </InputGroup>
  );
}

export const Password: Story = {
  render: (args) => <PasswordToggle size={args.size} disabled={args.disabled} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Digite sua senha");
    const toggleButton = canvas.getByRole("button", { name: "Mostrar senha" });

    await userEvent.type(input, "secret123");
    await expect(input).toHaveAttribute("type", "password");

    await userEvent.click(toggleButton);
    await expect(input).toHaveAttribute("type", "text");

    const hideButton = canvas.getByRole("button", { name: "Ocultar senha" });
    await userEvent.click(hideButton);
    await expect(input).toHaveAttribute("type", "password");
  },
};

export const Search: Story = {
  args: { placeholder: "Pesquisar..." },
  render: (args) => (
    <InputGroup size={args.size} className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon align="inline-start">
        <SmSearchLineIcon />
      </InputGroupAddon>
      <InputGroupInput type="search" placeholder={args.placeholder} disabled={args.disabled} />
      <InputGroupAddon align="inline-end">
        <Kbd className="!rounded-[4px] px-1.5 font-mono">CTRL+F</Kbd>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Disabled: Story = {
  args: { placeholder: "Campo desativado", disabled: true },
  render: (args) => (
    <Input
      className="w-full min-w-[300px] max-w-xs"
      placeholder={args.placeholder}
      disabled={args.disabled}
      size={args.size}
    />
  ),
};

export const WithLabel: Story = {
  args: { placeholder: "nome@exemplo.com" },
  render: (args) => (
    <div className="grid w-full min-w-[300px] max-w-xs gap-1.5">
      <Label htmlFor="email">E-mail</Label>
      <InputGroup size={args.size}>
        <InputGroupAddon align="inline-start">
          <SmMailSolidIcon />
        </InputGroupAddon>
        <InputGroupInput id="email" type="email" placeholder={args.placeholder} disabled={args.disabled} />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("E-mail");
    const input = canvas.getByPlaceholderText("nome@exemplo.com");

    await userEvent.click(label);
    await expect(input).toHaveFocus();
  },
};

export const Invalid: Story = {
  render: (args) => (
    <div className="grid w-full min-w-[300px] max-w-xs gap-1.5">
      <Label htmlFor="invalid-email">E-mail</Label>
      <Input
        id="invalid-email"
        type="email"
        size={args.size}
        placeholder="nome@exemplo.com"
        aria-invalid="true"
        defaultValue="not-an-email"
      />
    </div>
  ),
};

export const File: Story = {
  render: (args) => (
    <div className="flex w-full max-w-md flex-col gap-4">
      {(["lg", "md", "default", "sm", "xs"] as const).map((size) => (
        <label
          key={size}
          className="relative cursor-pointer"
        >
          <InputGroup size={size} className="w-[220px] cursor-pointer justify-center gap-2 px-2">
            <SmUploadLineIcon className="text-muted-foreground size-6 shrink-0" />
            <span className="text-muted-foreground text-sm font-medium select-none">
              Carregar arquivos
            </span>
          </InputGroup>
          <input type="file" className="sr-only" aria-label="Carregar arquivos" />
        </label>
      ))}
    </div>
  ),
};

const sizes = [
  { size: "lg" as const, label: "Large (80px)" },
  { size: "md" as const, label: "Medium (64px)" },
  { size: "default" as const, label: "Small / Default (48px)" },
  { size: "sm" as const, label: "Mini (40px)" },
  { size: "xs" as const, label: "Tiny (32px)" },
];

export const Sizes: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      {sizes.map(({ size, label }) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium">{label}</span>
          <InputGroup size={size}>
            <InputGroupAddon align="inline-start">
              <SmProfileLineIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Digite seu nome aqui" />
            <InputGroupAddon align="inline-end">
              <SmInfoLineIcon className="text-[var(--surface-600)]" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      ))}
    </div>
  ),
};
