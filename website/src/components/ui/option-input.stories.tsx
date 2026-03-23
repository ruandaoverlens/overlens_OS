import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";
import { OptionInput, OptionGroup } from "./option-input";

const meta = {
  title: "Base Components/OptionInput",
  tags: ["autodocs"],
  component: OptionInput,
  argTypes: {
    size: {
      control: "select",
      options: ["xxs", "xs", "sm", "md", "lg"],
    },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    option: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: [
          "Selectable option button with a leading badge label, used for quiz-style or multiple-choice inputs. Pairs with `OptionGroup` for managed selection state.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<OptionGroup value={selected} onValueChange={setSelected}>",
          "  <OptionInput option=\"A\" value=\"alpha\">Option Alpha</OptionInput>",
          "  <OptionInput option=\"B\" value=\"beta\">Option Beta</OptionInput>",
          "</OptionGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `OptionInput` | Button element with `role=\"option\"` and `aria-selected`. Renders a leading badge (`data-slot=\"option-input-badge\"`) and label (`data-slot=\"option-input-label\"`). Uses `data-slot=\"option-input\"`, `data-selected`, and `data-size` attributes. |",
          "| `OptionGroup` | Container `div` with `role=\"listbox\"`. Manages selection state via `value` and `onValueChange`. Set `multiple` for multi-select (`aria-multiselectable`). Clones children to inject `selected` and `onClick` props. |",
          "",
          "## Props (OptionInput)",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `option` | `string` | -- | Text displayed in the leading badge |",
          "| `selected` | `boolean` | `false` | Whether the option is selected |",
          "| `value` | `string` | -- | Selection value (falls back to `option` in OptionGroup) |",
          "| `size` | `\"xxs\"` \\| `\"xs\"` \\| `\"sm\"` \\| `\"md\"` \\| `\"lg\"` | `\"sm\"` | Size variant controlling height and padding |",
          "| `disabled` | `boolean` | `false` | Disables interaction |",
          "",
          "## Key details",
          "",
          "- Five size variants via CVA: `lg` (h-20), `md` (h-16), `sm` (h-12), `xs` (h-10), `xxs` (h-8).",
          "- Selected badge uses `bg-foreground/90 text-background`; unselected uses `bg-foreground/10 text-foreground/90`.",
          "- Selected state applies `border-2 border-foreground/90` via `data-[selected]:border-foreground/90`.",
          "- `OptionGroup` uses `React.Children.map` and `cloneElement` to inject selection props.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof OptionInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { option: "01", children: "Choice" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("option");
    await expect(option).toBeInTheDocument();
    await expect(canvas.getByText("Choice")).toBeInTheDocument();
    await expect(canvas.getByText("01")).toBeInTheDocument();

    // Verify default state: not selected
    await expect(option).toHaveAttribute("aria-selected", "false");
  },
};

export const Selected: Story = {
  args: { option: "01", children: "Choice", selected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("option");

    await expect(option).toHaveAttribute("aria-selected", "true");
    await expect(option).toHaveAttribute("data-selected", "true");

    // Verify the badge gets the selected styling
    const badge = canvasElement.querySelector('[data-slot="option-input-badge"]');
    await expect(badge).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { option: "01", children: "Choice", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("option");

    await expect(option).toBeDisabled();
  },
};

export const Quiz: Story = {
  render: function Quiz() {
    const [selected, setSelected] = useState<string | undefined>();

    return (
      <div className="flex flex-col gap-4 w-[400px]">
        <p className="text-foreground font-body text-base">
          Qual e o principal objetivo do Design System?
        </p>
        <OptionGroup value={selected} onValueChange={setSelected}>
          <OptionInput option="A" value="a">
            Padronizar a interface
          </OptionInput>
          <OptionInput option="B" value="b">
            Aumentar a velocidade do servidor
          </OptionInput>
          <OptionInput option="C" value="c">
            Substituir o time de design
          </OptionInput>
          <OptionInput option="D" value="d">
            Reduzir o numero de paginas
          </OptionInput>
        </OptionGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the OptionGroup renders as a listbox
    const listbox = canvas.getByRole("listbox");
    await expect(listbox).toBeInTheDocument();

    const options = canvas.getAllByRole("option");
    await expect(options.length).toBe(4);

    // No option should be selected initially
    for (const option of options) {
      await expect(option).toHaveAttribute("aria-selected", "false");
    }

    // Click the first option
    await userEvent.click(options[0]);

    // First option should now be selected
    await expect(options[0]).toHaveAttribute("aria-selected", "true");

    // Click a different option
    await userEvent.click(options[2]);

    // Third option should now be selected, first should not
    await expect(options[2]).toHaveAttribute("aria-selected", "true");
    await expect(options[0]).toHaveAttribute("aria-selected", "false");
  },
};

export const MultipleChoice: Story = {
  render: function MultipleChoice() {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (val: string) => {
      setSelected((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
      );
    };

    return (
      <div className="flex flex-col gap-4 w-[400px]">
        <p className="text-foreground font-body text-base">
          Selecione os principios do Atomic Design:
        </p>
        <OptionGroup value={selected} onValueChange={toggle} multiple>
          <OptionInput option="01" value="atoms">
            Atoms
          </OptionInput>
          <OptionInput option="02" value="molecules">
            Molecules
          </OptionInput>
          <OptionInput option="03" value="organisms">
            Organisms
          </OptionInput>
          <OptionInput option="04" value="controllers">
            Controllers
          </OptionInput>
        </OptionGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify multiselectable attribute
    const listbox = canvas.getByRole("listbox");
    await expect(listbox).toHaveAttribute("aria-multiselectable", "true");

    const options = canvas.getAllByRole("option");

    // Select first and third options
    await userEvent.click(options[0]);
    await userEvent.click(options[2]);

    // Both should be selected
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
    await expect(options[2]).toHaveAttribute("aria-selected", "true");

    // Others should not
    await expect(options[1]).toHaveAttribute("aria-selected", "false");
    await expect(options[3]).toHaveAttribute("aria-selected", "false");

    // Deselect the first option
    await userEvent.click(options[0]);
    await expect(options[0]).toHaveAttribute("aria-selected", "false");

    // Third should still be selected
    await expect(options[2]).toHaveAttribute("aria-selected", "true");
  },
};

export const WithDisabledOptions: Story = {
  render: function WithDisabledOptions() {
    const [selected, setSelected] = useState<string | undefined>();

    return (
      <div className="flex flex-col gap-4 w-[400px]">
        <p className="text-foreground font-body text-base">
          Escolha a linguagem:
        </p>
        <OptionGroup value={selected} onValueChange={setSelected}>
          <OptionInput option="A" value="ts">TypeScript</OptionInput>
          <OptionInput option="B" value="js">JavaScript</OptionInput>
          <OptionInput option="C" value="rs" disabled>Rust (em breve)</OptionInput>
          <OptionInput option="D" value="go" disabled>Go (em breve)</OptionInput>
        </OptionGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole("option");

    // Verify disabled options
    await expect(options[2]).toBeDisabled();
    await expect(options[3]).toBeDisabled();

    // Verify enabled options
    await expect(options[0]).not.toBeDisabled();
    await expect(options[1]).not.toBeDisabled();

    // Select an enabled option
    await userEvent.click(options[1]);
    await expect(options[1]).toHaveAttribute("aria-selected", "true");
  },
};

export const CompactQuiz: Story = {
  render: function CompactQuiz() {
    const [selected, setSelected] = useState<string | undefined>();

    return (
      <div className="flex flex-col gap-3 w-[300px]">
        <p className="text-foreground font-body text-sm">
          Verdadeiro ou falso?
        </p>
        <OptionGroup value={selected} onValueChange={setSelected}>
          <OptionInput size="xs" option="V" value="true">
            Verdadeiro
          </OptionInput>
          <OptionInput size="xs" option="F" value="false">
            Falso
          </OptionInput>
        </OptionGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole("option");
    await expect(options.length).toBe(2);

    // Both should use xs size
    await expect(options[0]).toHaveAttribute("data-size", "xs");
    await expect(options[1]).toHaveAttribute("data-size", "xs");

    // Select "Verdadeiro"
    await userEvent.click(options[0]);
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
    await expect(options[1]).toHaveAttribute("aria-selected", "false");

    // Switch to "Falso"
    await userEvent.click(options[1]);
    await expect(options[1]).toHaveAttribute("aria-selected", "true");
    await expect(options[0]).toHaveAttribute("aria-selected", "false");
  },
};

/** Exercises OptionInput with value prop different from option prop. */
export const ValueVsOption: Story = {
  name: "Valor diferente da opcao",
  render: function ValueVsOption() {
    const [selected, setSelected] = useState<string | undefined>();

    return (
      <div className="flex flex-col gap-4 w-[400px]">
        <p className="text-foreground font-body text-base">
          Quando o valor e diferente do label da opcao:
        </p>
        <OptionGroup value={selected} onValueChange={setSelected}>
          <OptionInput option="A" value="option-alpha">
            Opcao Alpha
          </OptionInput>
          <OptionInput option="B" value="option-beta">
            Opcao Beta
          </OptionInput>
        </OptionGroup>
        {selected && (
          <p data-testid="selected-value" className="text-sm text-muted-foreground">
            Valor selecionado: {selected}
          </p>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole("option");

    // Click option A
    await userEvent.click(options[0]);

    // Verify the correct value was passed (not the option label)
    const valueDisplay = canvasElement.querySelector('[data-testid="selected-value"]');
    await expect(valueDisplay).toBeInTheDocument();
    await expect(valueDisplay).toHaveTextContent("Valor selecionado: option-alpha");
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-[320px]">
      <OptionInput size="lg" option="A">Large</OptionInput>
      <OptionInput size="md" option="B">Medium</OptionInput>
      <OptionInput size="sm" option="C">Small</OptionInput>
      <OptionInput size="xs" option="D">Mini</OptionInput>
      <OptionInput size="xxs" option="E">Tiny</OptionInput>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole("option");
    await expect(options.length).toBe(5);

    // Verify each size renders with correct data-size attribute
    await expect(options[0]).toHaveAttribute("data-size", "lg");
    await expect(options[1]).toHaveAttribute("data-size", "md");
    await expect(options[2]).toHaveAttribute("data-size", "sm");
    await expect(options[3]).toHaveAttribute("data-size", "xs");
    await expect(options[4]).toHaveAttribute("data-size", "xxs");
  },
};

export const AllSizesSelected: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-[320px]">
      <OptionInput size="lg" option="A" selected>Large</OptionInput>
      <OptionInput size="md" option="B" selected>Medium</OptionInput>
      <OptionInput size="sm" option="C" selected>Small</OptionInput>
      <OptionInput size="xs" option="D" selected>Mini</OptionInput>
      <OptionInput size="xxs" option="E" selected>Tiny</OptionInput>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const options = canvas.getAllByRole("option");

    // All should be selected
    for (const option of options) {
      await expect(option).toHaveAttribute("aria-selected", "true");
    }
  },
};
