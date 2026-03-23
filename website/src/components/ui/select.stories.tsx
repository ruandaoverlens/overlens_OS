import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./select";
import { Label } from "./label";

const meta = {
  title: "Base Components/Select",
  tags: ["autodocs"],
  component: Select,
  argTypes: {
    disabled: { control: "boolean" },
    onValueChange: { control: false },
    onOpenChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Custom select dropdown built on Radix Select primitive with grouped options, size variants, and scroll indicators.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Select>",
          "  <SelectTrigger>",
          "    <SelectValue placeholder=\"...\" />",
          "  </SelectTrigger>",
          "  <SelectContent>",
          "    <SelectGroup>",
          "      <SelectLabel>Group</SelectLabel>",
          "      <SelectItem value=\"a\">Option A</SelectItem>",
          "    </SelectGroup>",
          "    <SelectSeparator />",
          "  </SelectContent>",
          "</Select>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Select` | Root provider wrapping `SelectPrimitive.Root`. Uses `data-slot=\"select\"`. |",
          "| `SelectTrigger` | Button that toggles the dropdown. Accepts `size` prop (`\"lg\"` \\| `\"md\"` \\| `\"default\"` \\| `\"sm\"` \\| `\"xs\"`). Uses `data-slot=\"select-trigger\"` and `data-size`. |",
          "| `SelectValue` | Displays the current selection or placeholder inside the trigger. Uses `data-slot=\"select-value\"`. |",
          "| `SelectContent` | Dropdown panel rendered via portal with entry/exit animations. Accepts `position` (`\"popper\"` \\| `\"item-aligned\"`), `side`, and `sideOffset`. Uses `data-slot=\"select-content\"`. |",
          "| `SelectGroup` | Groups related options. Uses `data-slot=\"select-group\"`. |",
          "| `SelectLabel` | Uppercase label for an option group. Uses `data-slot=\"select-label\"`. |",
          "| `SelectItem` | Selectable option with a check indicator (`SmCheckLineIcon`). Uses `data-slot=\"select-item\"`. |",
          "| `SelectSeparator` | Horizontal divider between groups. Uses `data-slot=\"select-separator\"`. |",
          "| `SelectScrollUpButton` / `SelectScrollDownButton` | Arrow indicators shown when content overflows. |",
          "",
          "## Key details",
          "",
          "- Trigger sizes are applied via `data-size` attribute with corresponding Tailwind `data-[size=*]` selectors for height, border-radius, and font-size.",
          "- Content uses `bg-popover` with fade/zoom/slide animations keyed to `data-[state]` and `data-[side]`.",
          "- The trigger is `w-full` by default and fills its parent container.",
          "- Uses `SmArrowDownIosLineIcon` as the chevron, `SmArrowUpwardLineIcon` / `SmArrowDownwardLineIcon` for scroll buttons.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[200px]" aria-label="Fruit">
        <SelectValue placeholder="Selecione uma fruta" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Maçã</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cereja</SelectItem>
        <SelectItem value="grape">Uvas</SelectItem>
        <SelectItem value="orange">Laranja</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("combobox", { name: "Fruit" });

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveTextContent("Selecione uma fruta");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("data-state", "open");

    await userEvent.keyboard("{Escape}");
  },
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]" aria-label="Timezone">
        <SelectValue placeholder="Selecione um fuso horário" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>América do Norte</SelectLabel>
          <SelectItem value="est">Leste (EST)</SelectItem>
          <SelectItem value="cst">Central (CST)</SelectItem>
          <SelectItem value="pst">Pacífico (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europa</SelectLabel>
          <SelectItem value="gmt">GMT</SelectItem>
          <SelectItem value="cet">Europa Central (CET)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("combobox", { name: "Timezone" });

    await userEvent.click(trigger);

    const listbox = await within(document.body).findByRole("listbox");

    const gmtOption = within(listbox).getByRole("option", { name: "GMT" });
    await expect(gmtOption).toBeInTheDocument();
    await userEvent.click(gmtOption);

    await expect(trigger).toHaveTextContent("GMT");
  },
};

export const Small: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]" size="sm" aria-label="Option">
        <SelectValue placeholder="Seleção pequena" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Opção 1</SelectItem>
        <SelectItem value="2">Opção 2</SelectItem>
        <SelectItem value="3">Opção 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]" aria-label="Plan">
        <SelectValue placeholder="Selecione um plano" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Gratuito</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise (Fale conosco)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-1.5">
      <Label>Framework</Label>
      <Select defaultValue="next">
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="remix">Remix</SelectItem>
          <SelectItem value="astro">Astro</SelectItem>
          <SelectItem value="nuxt">Nuxt</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["lg", "md", "default", "sm", "xs"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-16">{size}</span>
          <Select>
            <SelectTrigger size={size} aria-label={`Tamanho ${size}`}>
              <SelectValue placeholder={`Tamanho ${size}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Opção 1</SelectItem>
              <SelectItem value="2">Opção 2</SelectItem>
              <SelectItem value="3">Opção 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  ),
};
