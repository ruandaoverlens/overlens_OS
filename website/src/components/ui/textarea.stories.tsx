import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./textarea";
import { Label } from "./label";

const meta = {
  title: "Base Components/Textarea",
  tags: ["autodocs"],
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: [
          "Multi-line text input with auto-sizing content, custom resize handle, and size variants.",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `size` | `'sm' \\| 'default' \\| 'lg'` | `'default'` | Controls min-height, padding, and font size |",
          "| `placeholder` | `string` | - | Placeholder text |",
          "| `disabled` | `boolean` | `false` | Disables input and reduces opacity |",
          "| `maxLength` | `number` | - | Native character limit |",
          "| `defaultValue` | `string` | - | Initial value (uncontrolled) |",
          "| `value` | `string` | - | Controlled value |",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Textarea placeholder=\"Write here...\" />",
          "<Textarea size=\"sm\" disabled />",
          "<Textarea size=\"lg\" maxLength={500} />",
          "```",
          "",
          "## Size variants",
          "",
          "| Size | Min height | Font | Padding |",
          "|------|-----------|------|---------|",
          "| `sm` | 80px | `text-sm` (14px) | `px-4 pt-2.5 pb-3` |",
          "| `default` | 100px | `text-base` (16px) | `px-4 pt-3 pb-4` |",
          "| `lg` | 120px | `text-base` (16px) | `px-4 pt-3 pb-5` |",
          "",
          "## Key details",
          "",
          "- Auto-grows with content via `field-sizing: content`",
          "- Custom drag handle in bottom-right corner for manual resizing",
          "- Default width is `300px` - override with `className`",
          "- Custom scrollbar: thin thumb (`muted-foreground/30`), transparent track",
          "- Focus state shows `border-input` and removes background",
          "- Supports `aria-invalid` for error states with destructive ring",
          "- `disabled` state sets `opacity-50` and blocks pointer events",
          "- Autofill: overrides browser background with `oklch(0.21 0 0)` (matches `dark:bg-input/30` on black) and preserves text color",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    maxLength: { control: "number" },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    onChange: { control: false },
    onFocus: { control: false },
    onBlur: { control: false },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Escreva seu texto aqui" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByPlaceholderText("Escreva seu texto aqui");

    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveAttribute("data-slot", "textarea");

    await userEvent.type(textarea, "Olá, mundo!");
    await expect(textarea).toHaveValue("Olá, mundo!");
  },
};

export const Small: Story = {
  args: { placeholder: "Escreva seu texto aqui (sm)", size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Escreva seu texto aqui (sm)");
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveAttribute("data-slot", "textarea");
    await userEvent.type(textarea, "Texto pequeno");
    await expect(textarea).toHaveValue("Texto pequeno");
  },
};

export const Large: Story = {
  args: { placeholder: "Escreva seu texto aqui (lg)", size: "lg" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Escreva seu texto aqui (lg)");
    await expect(textarea).toBeInTheDocument();
    await userEvent.type(textarea, "Texto grande");
    await expect(textarea).toHaveValue("Texto grande");
  },
};

export const Filled: Story = {
  args: {
    defaultValue:
      "Hoje eu não quero nem saber, vou maratonar todas as aulas da Overlens, sem dó nem piedade. Quero assistir todas as aulas porque agora vou me tornar nexialista e ninguém vai me impedir. Esse comentário ficou muito ruim, mas eu precisava de um texto longo.",
  },
  play: async ({ canvasElement }) => {
    const textarea = canvasElement.querySelector('[data-slot="textarea"]') as HTMLTextAreaElement;
    await expect(textarea).toBeInTheDocument();
    await expect(textarea.value).toContain("maratonar todas as aulas");
  },
};

export const Disabled: Story = {
  args: { placeholder: "Escreva seu texto aqui", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Escreva seu texto aqui");
    await expect(textarea).toBeDisabled();
  },
};

export const WithMaxLength: Story = {
  args: { placeholder: "Máximo 20 caracteres", maxLength: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Máximo 20 caracteres");
    await expect(textarea).toHaveAttribute("maxlength", "20");

    await userEvent.type(textarea, "12345678901234567890Extra");
    await expect((textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(20);
  },
};

export const WithScroll: Story = {
  args: {
    className: "max-h-[160px]",
    defaultValue: "Hoje eu não quero nem saber, vou maratonar todas as aulas da Overlens, sem dó nem piedade. Quero assistir todas as aulas porque agora vou me tornar nexialista e ninguém vai me impedir. Esse comentário ficou muito ruim, mas eu precisava de um texto longo. Hoje eu não quero nem saber, vou maratonar todas as aulas da Overlens, sem dó nem piedade. Quero assistir todas as aulas porque agora vou me tornar nexialista e ninguém vai me impedir. Esse comentário ficou muito ruim, mas eu precisava de um texto longo.",
  },
  play: async ({ canvasElement }) => {
    const textarea = canvasElement.querySelector('[data-slot="textarea"]') as HTMLTextAreaElement;
    await expect(textarea).toBeInTheDocument();
    await expect(textarea.value.length).toBeGreaterThan(100);
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-1.5">
      <Label htmlFor="message">Sua mensagem</Label>
      <Textarea id="message" placeholder="Escreva seu texto aqui" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const label = canvas.getByText("Sua mensagem");
    await userEvent.click(label);

    const textarea = canvas.getByPlaceholderText("Escreva seu texto aqui");
    await expect(textarea).toHaveFocus();
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Textarea size="sm" placeholder="Escreva seu texto aqui (sm)" />
      <Textarea size="default" placeholder="Escreva seu texto aqui (default)" />
      <Textarea size="lg" placeholder="Escreva seu texto aqui (lg)" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const textareas = canvasElement.querySelectorAll('[data-slot="textarea"]');
    await expect(textareas.length).toBe(3);

    // Verify the resize handle is present for each
    const handles = canvasElement.querySelectorAll('[data-slot="textarea-handle"]');
    await expect(handles.length).toBe(3);
  },
};
