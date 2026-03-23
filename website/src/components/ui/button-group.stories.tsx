import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  MdArrowBackLineIcon,
  MdArrowForwardLineIcon,
  MdArrowUpwardLineIcon,
  MdArrowDownwardLineIcon,
} from "@/components/icons";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";
import { Button } from "./button";

const meta = {
  title: "Base Components/ButtonGroup",
  tags: ["autodocs"],
  component: ButtonGroup,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Direção do layout dos botões agrupados",
      table: { defaultValue: { summary: "horizontal" } },
    },
    children: {
      control: false,
      description: "Botões, separadores e segmentos de texto para agrupar",
    },
  },
  args: { orientation: "horizontal" },
  parameters: {
    docs: {
      description: {
        component: [
          "Compound component that groups related buttons with shared borders, optional separators, and text segments. Supports horizontal and vertical orientation via CVA.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<ButtonGroup orientation=\"horizontal\">",
          "  <ButtonGroupText>Label</ButtonGroupText>",
          "  <Button variant=\"outline\" size=\"icon\">",
          "    <Icon />",
          "  </Button>",
          "  <ButtonGroupSeparator />",
          "  <Button variant=\"outline\" size=\"icon\">",
          "    <Icon />",
          "  </Button>",
          "</ButtonGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `ButtonGroup` | Root container with `role=\"group\"` and `data-slot=\"button-group\"`. Strips inner border-radius between children and applies negative margin to collapse borders |",
          "| `ButtonGroupText` | Static text/label segment with `border-2 border-[var(--surface-900)]` and `rounded-lg`. Supports `asChild` via Radix `Slot.Root` |",
          "| `ButtonGroupSeparator` | Thin divider line between buttons using the `Separator` component. Defaults to `vertical` orientation |",
          "",
          "## Key details",
          "",
          "- Orientation is stored as `data-orientation` attribute on the root",
          "- Horizontal mode removes left border-radius from non-first children and right border-radius from non-last children, with `-ml-0.5` overlap",
          "- Vertical mode does the same for top/bottom radii with `-mt-0.5` overlap",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" size="icon" aria-label="Voltar">
        <MdArrowBackLineIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Subir">
        <MdArrowUpwardLineIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Avançar">
        <MdArrowForwardLineIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group");
    await expect(group).toBeInTheDocument();
    await expect(group).toHaveAttribute("data-slot", "button-group");
    await expect(group).toHaveAttribute("data-orientation", "horizontal");

    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(3);

    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveFocus();
  },
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline" size="icon" aria-label="Subir">
        <MdArrowUpwardLineIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Voltar">
        <MdArrowBackLineIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Descer">
        <MdArrowDownwardLineIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group");
    await expect(group).toHaveAttribute("data-orientation", "vertical");
    await expect(group).toHaveAttribute("data-slot", "button-group");

    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(3);

    await userEvent.click(buttons[1]);
    await expect(buttons[1]).toHaveFocus();
  },
};

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Voltar">
        <MdArrowBackLineIcon />
      </Button>
      <ButtonGroupSeparator />
      <Button variant="outline" size="icon" aria-label="Avançar">
        <MdArrowForwardLineIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const separator = canvasElement.querySelector(
      '[data-slot="button-group-separator"]'
    );
    await expect(separator).toBeInTheDocument();

    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(2);

    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveFocus();

    await userEvent.click(buttons[1]);
    await expect(buttons[1]).toHaveFocus();
  },
};

export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>Página 1</ButtonGroupText>
      <Button variant="outline" size="icon" aria-label="Voltar">
        <MdArrowBackLineIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Avançar">
        <MdArrowForwardLineIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Página 1")).toBeInTheDocument();

    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(2);

    await userEvent.click(buttons[0]);
    await expect(buttons[0]).toHaveFocus();
  },
};

export const WithTextAsChild: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText asChild>
        <span>Texto personalizado</span>
      </ButtonGroupText>
      <Button variant="outline" size="icon" aria-label="Avançar">
        <MdArrowForwardLineIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textElement = canvas.getByText("Texto personalizado");
    await expect(textElement).toBeInTheDocument();
    await expect(textElement.tagName.toLowerCase()).toBe("span");
  },
};

export const VerticalWithSeparator: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline" size="icon" aria-label="Subir">
        <MdArrowUpwardLineIcon />
      </Button>
      <ButtonGroupSeparator orientation="horizontal" />
      <Button variant="outline" size="icon" aria-label="Descer">
        <MdArrowDownwardLineIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const group = canvas.getByRole("group");
    await expect(group).toHaveAttribute("data-orientation", "vertical");

    const separator = canvasElement.querySelector(
      '[data-slot="button-group-separator"]'
    );
    await expect(separator).toBeInTheDocument();

    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(2);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {/* Horizontal */}
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Voltar">
          <MdArrowBackLineIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Subir">
          <MdArrowUpwardLineIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Avançar">
          <MdArrowForwardLineIcon />
        </Button>
      </ButtonGroup>

      {/* Vertical */}
      <ButtonGroup orientation="vertical">
        <Button variant="outline" size="icon" aria-label="Subir">
          <MdArrowUpwardLineIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Voltar">
          <MdArrowBackLineIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Descer">
          <MdArrowDownwardLineIcon />
        </Button>
      </ButtonGroup>

      {/* Com separador */}
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Voltar">
          <MdArrowBackLineIcon />
        </Button>
        <ButtonGroupSeparator />
        <Button variant="outline" size="icon" aria-label="Avançar">
          <MdArrowForwardLineIcon />
        </Button>
      </ButtonGroup>

      {/* Com texto */}
      <ButtonGroup>
        <ButtonGroupText>Nav</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="Avançar">
          <MdArrowForwardLineIcon />
        </Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll('[data-slot="button-group"]');
    await expect(groups).toHaveLength(4);

    await expect(groups[0]).not.toHaveAttribute("data-orientation");
    await expect(groups[1]).toHaveAttribute("data-orientation", "vertical");

    const canvas = within(canvasElement);
    await expect(canvas.getByText("Nav")).toBeInTheDocument();
  },
};
