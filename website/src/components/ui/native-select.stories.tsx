import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";
import { Label } from "./label";

const meta = {
  title: "Base Components/NativeSelect",
  tags: ["autodocs"],
  component: NativeSelect,
  parameters: {
    docs: {
      description: {
        component: [
          "Browser-native `<select>` dropdown with custom styling and five size variants. Uses a chevron icon overlay instead of the default browser arrow.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<NativeSelect size=\"default\">",
          "  <NativeSelectOptGroup label=\"Group\">",
          "    <NativeSelectOption value=\"a\">Option A</NativeSelectOption>",
          "  </NativeSelectOptGroup>",
          "</NativeSelect>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `NativeSelect` | Wrapper `<div>` + `<select>` with CVA size variants and a `SmArrowDownIosLineIcon` overlay. Hides the native arrow via `appearance-none`. Sizes: `xs` (h-8, rounded-[6px]), `sm` (h-10, rounded-[8px]), `default` (h-12), `md` (h-16), `lg` (h-20) -- the latter three use `rounded-[12px]`. Uses `data-slot=\"native-select\"` and `data-size`. |",
          "| `NativeSelectOption` | Styled `<option>` with `text-black bg-white` for native dropdown readability. Uses `data-slot=\"native-select-option\"`. |",
          "| `NativeSelectOptGroup` | Styled `<optgroup>` with `font-medium text-black bg-white`. Uses `data-slot=\"native-select-optgroup\"`. |",
          "",
          "## Key details",
          "",
          "- Background uses `bg-accent/50` (light) / `bg-input/30` (dark) with hover states `bg-accent` / `bg-input/50`",
          "- Focus state shows a `border-input` 2px border and transparent background",
          "- Invalid state uses `aria-invalid` with `ring-2 ring-destructive` styling",
          "- Disabled state applies `opacity-50`, `pointer-events-none`, and `cursor-not-allowed`",
          "- The chevron icon is positioned absolute with `pointer-events-none` so clicks pass through to the select",
          "- The `size` prop on `NativeSelect` uses CVA and is separate from the HTML `size` attribute (which is omitted from the type)",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["lg", "md", "default", "sm", "xs"],
    },
    disabled: { control: "boolean" },
    onChange: { control: false },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[200px]">
      <NativeSelect {...args} aria-label="Selecione uma fruta">
        <NativeSelectOption value="">Selecione uma fruta</NativeSelectOption>
        <NativeSelectOption value="apple">Maçã</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
        <NativeSelectOption value="cherry">Cereja</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const select = canvas.getByRole("combobox", { name: "Selecione uma fruta" });
    await expect(select).toBeInTheDocument();

    // Verify options are present
    const options = select.querySelectorAll("option");
    await expect(options.length).toBe(4);

    // Verify default selected value is the placeholder
    await expect(select).toHaveValue("");

    // Verify specific option values exist
    await expect(canvas.getByText("Maçã")).toBeInTheDocument();
    await expect(canvas.getByText("Banana")).toBeInTheDocument();
    await expect(canvas.getByText("Cereja")).toBeInTheDocument();
  },
};

export const WithOptGroup: Story = {
  render: () => (
    <div className="grid w-[200px] gap-1.5">
      <Label>Fuso horário</Label>
      <NativeSelect>
        <NativeSelectOptGroup label="América do Norte">
          <NativeSelectOption value="est">Leste</NativeSelectOption>
          <NativeSelectOption value="cst">Central</NativeSelectOption>
          <NativeSelectOption value="pst">Pacífico</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Europa">
          <NativeSelectOption value="gmt">GMT</NativeSelectOption>
          <NativeSelectOption value="cet">CET</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const select = canvas.getByRole("combobox");
    await expect(select).toBeVisible();

    const optGroups = select.querySelectorAll("optgroup");
    await expect(optGroups.length).toBe(2);
    await expect(optGroups[0]).toHaveAttribute("label", "América do Norte");
    await expect(optGroups[1]).toHaveAttribute("label", "Europa");

    await expect(canvas.getByText("Leste")).toBeInTheDocument();
    await expect(canvas.getByText("GMT")).toBeInTheDocument();
  },
};

export const Small: Story = {
  render: () => (
    <div className="w-[200px]">
      <NativeSelect size="sm" aria-label="Tamanho">
        <NativeSelectOption value="s">Pequeno</NativeSelectOption>
        <NativeSelectOption value="m">Médio</NativeSelectOption>
        <NativeSelectOption value="l">Grande</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["lg", "md", "default", "sm", "xs"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-16">{size}</span>
          <NativeSelect size={size} aria-label={`Tamanho ${size}`}>
            <NativeSelectOption value="">Selecione uma opção</NativeSelectOption>
            <NativeSelectOption value="1">Opção 1</NativeSelectOption>
            <NativeSelectOption value="2">Opção 2</NativeSelectOption>
          </NativeSelect>
        </div>
      ))}
    </div>
  ),
};
