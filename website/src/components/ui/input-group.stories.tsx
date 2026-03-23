import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { SmSearchLineIcon, SmArrowForwardLineIcon } from "@/components/icons";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";

const meta = {
  title: "Base Components/InputGroup",
  tags: ["autodocs"],
  component: InputGroup,
  argTypes: {
    size: {
      control: "select",
      options: ["lg", "md", "default", "sm", "xs"],
      table: { defaultValue: { summary: "default" } },
    },
    children: { control: false },
    className: { control: "text" },
  },
  args: { size: "default" },
  parameters: {
    docs: {
      description: {
        component: [
          "Composite input container that combines an input or textarea with addon slots (icons, buttons, text) at any edge.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<InputGroup size=\"default\">",
          "  <InputGroupAddon align=\"inline-start\">",
          "    <Icon />",
          "  </InputGroupAddon>",
          "  <InputGroupInput placeholder=\"...\" />",
          "  <InputGroupAddon align=\"inline-end\">",
          "    <InputGroupButton size=\"xs\">Action</InputGroupButton>",
          "  </InputGroupAddon>",
          "</InputGroup>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `InputGroup` | Root container with `group/input-group` and CVA size variants (`lg`/`md`/`default`/`sm`/`xs`). Sets `role=\"group\"` and `data-slot=\"input-group\"` |",
          "| `InputGroupAddon` | Addon slot with `align` prop: `\"inline-start\"` \\| `\"inline-end\"` \\| `\"block-start\"` \\| `\"block-end\"`. Clicks focus the sibling input |",
          "| `InputGroupButton` | Compact button via `<Button>` with CVA sizes: `\"xs\"` (h-6), `\"sm\"` (h-8), `\"icon-xs\"` (size-6), `\"icon-sm\"` (size-8). Default variant `ghost` |",
          "| `InputGroupText` | Static text/icon content styled `text-muted-foreground text-sm` |",
          "| `InputGroupInput` | Styled `<Input>` with transparent background, no border/ring, and `data-slot=\"input-group-control\"` for focus delegation |",
          "| `InputGroupTextarea` | Styled `<Textarea>` with transparent background, no border/ring, and `data-slot=\"input-group-control\"` |",
          "",
          "## Key details",
          "",
          "- Focus detection uses `has-[[data-slot=input-group-control]:focus-visible]` to apply border to the group container",
          "- Invalid state detected via `has-[[data-slot][aria-invalid=true]]` applying `border-destructive`",
          "- Block-start/block-end addons switch the group to `flex-col` layout via `has-[>[data-align=block-start]]`",
          "- InputGroupAddon click handler auto-focuses the nearest sibling `<input>`, skipping if a `<button>` was clicked",
          "- Disabled state propagates via `group-data-[disabled=true]/input-group` reducing addon opacity",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "default",
  },
  render: (args) => (
    <InputGroup {...args} className="w-full min-w-[300px] max-w-xs">
      <InputGroupInput placeholder="Digite o texto..." />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByPlaceholderText("Digite o texto...");
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveValue("");

    await userEvent.click(input);
    await userEvent.type(input, "Hello World");

    await expect(input).toHaveValue("Hello World");

    const group = canvasElement.querySelector('[data-slot="input-group"]');
    await expect(group).toBeInTheDocument();
  },
};

export const WithAddon: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon>
        <SmSearchLineIcon className="h-4 w-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="Pesquisar..." />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addon = canvasElement.querySelector('[data-slot="input-group-addon"]');
    await expect(addon).toBeInTheDocument();
    await expect(addon).toHaveAttribute("data-align", "inline-start");

    const input = canvas.getByPlaceholderText("Pesquisar...");
    await userEvent.type(input, "busca");
    await expect(input).toHaveValue("busca");
  },
};

export const WithAddonEnd: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupInput placeholder="Pesquisar..." />
      <InputGroupAddon align="inline-end">
        <SmArrowForwardLineIcon />
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addon = canvasElement.querySelector('[data-slot="input-group-addon"]');
    await expect(addon).toBeInTheDocument();
    await expect(addon).toHaveAttribute("data-align", "inline-end");

    const input = canvas.getByPlaceholderText("Pesquisar...");
    await userEvent.type(input, "teste");
    await expect(input).toHaveValue("teste");
  },
};

export const WithAddonBlockStart: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon align="block-start">
        <InputGroupText>Cabeçalho</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Digite abaixo do cabeçalho..." />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addon = canvasElement.querySelector('[data-slot="input-group-addon"]');
    await expect(addon).toBeInTheDocument();
    await expect(addon).toHaveAttribute("data-align", "block-start");

    await expect(canvas.getByText("Cabeçalho")).toBeInTheDocument();

    const input = canvas.getByPlaceholderText("Digite abaixo do cabeçalho...");
    await userEvent.type(input, "conteúdo");
    await expect(input).toHaveValue("conteúdo");
  },
};

export const WithAddonBlockEnd: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupInput placeholder="Digite acima do rodapé..." />
      <InputGroupAddon align="block-end">
        <InputGroupText>Rodapé</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addon = canvasElement.querySelector('[data-slot="input-group-addon"]');
    await expect(addon).toBeInTheDocument();
    await expect(addon).toHaveAttribute("data-align", "block-end");

    await expect(canvas.getByText("Rodapé")).toBeInTheDocument();
  },
};

export const WithButton: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupInput placeholder="Pesquisar..." />
      <InputGroupAddon align="inline-end">
        <button type="button" aria-label="Enviar" className="inline-flex items-center justify-center pr-1 text-muted-foreground transition-colors hover:text-foreground outline-none">
          <SmArrowForwardLineIcon />
        </button>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: "Enviar" });
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute("type", "button");

    await userEvent.click(button);
    await expect(button).toHaveFocus();

    const input = canvas.getByPlaceholderText("Pesquisar...");
    await userEvent.type(input, "teste");
    await expect(input).toHaveValue("teste");
  },
};


export const WithText: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon>
        <InputGroupText>R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="0,00" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>BRL</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("R$")).toBeInTheDocument();
    await expect(canvas.getByText("BRL")).toBeInTheDocument();

    const addons = canvasElement.querySelectorAll('[data-slot="input-group-addon"]');
    await expect(addons).toHaveLength(2);
    await expect(addons[0]).toHaveAttribute("data-align", "inline-start");
    await expect(addons[1]).toHaveAttribute("data-align", "inline-end");

    const input = canvas.getByPlaceholderText("0,00");
    await userEvent.type(input, "150,00");
    await expect(input).toHaveValue("150,00");
  },
};

export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-sm">
      <InputGroupAddon align="block-start">
        <InputGroupText>Mensagem</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Digite sua mensagem aqui..." />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Mensagem")).toBeInTheDocument();

    const textarea = canvas.getByPlaceholderText("Digite sua mensagem aqui...");
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveAttribute("data-slot", "input-group-control");

    await userEvent.type(textarea, "Olá, esta é uma mensagem de teste.");
    await expect(textarea).toHaveValue("Olá, esta é uma mensagem de teste.");
  },
};

export const AddonFocusInput: Story = {
  render: () => (
    <InputGroup className="w-full min-w-[300px] max-w-xs">
      <InputGroupAddon data-testid="clickable-addon">
        <SmSearchLineIcon className="h-4 w-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="Clique no ícone..." />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addon = canvas.getByTestId("clickable-addon");
    await userEvent.click(addon);

    const input = canvas.getByPlaceholderText("Clique no ícone...");
    await expect(input).toHaveFocus();
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["lg", "md", "default", "sm", "xs"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-16">{size}</span>
          <InputGroup size={size} className="w-full min-w-[300px] max-w-xs">
            <InputGroupAddon>
              <SmSearchLineIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder={`Tamanho ${size}`} />
          </InputGroup>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll('[data-slot="input-group"]');
    await expect(groups).toHaveLength(5);

    const expectedSizes = ["lg", "md", "default", "sm", "xs"];
    for (let i = 0; i < groups.length; i++) {
      await expect(groups[i]).toHaveAttribute("data-size", expectedSizes[i]);
    }
  },
};
