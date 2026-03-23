import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";
import {
  SmProfileLineIcon,
  SmMailSolidIcon,
  SmLockSolidIcon,
  SmSearchLineIcon,
} from "@/components/icons";

const meta = {
  title: "Base Components/Field",
  tags: ["autodocs"],
  component: Field,
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal", "responsive"],
      description: "Orientação do layout do campo",
    },
  },
  args: { orientation: "vertical" },
  parameters: {
    docs: {
      description: {
        component: [
          "Form field layout system for grouping labels, inputs, descriptions, and error messages. Uses CVA for orientation variants.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<FieldSet>",
          "  <FieldLegend />",
          "  <FieldGroup>",
          "    <Field orientation=\"vertical\">",
          "      <FieldLabel />",
          "      <FieldContent>",
          "        <Input />",
          "        <FieldDescription />",
          "      </FieldContent>",
          "      <FieldError />",
          "    </Field>",
          "    <FieldSeparator>or</FieldSeparator>",
          "    <Field>",
          "      <FieldTitle />",
          "      <Input />",
          "    </Field>",
          "  </FieldGroup>",
          "</FieldSet>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `FieldSet` | Semantic `<fieldset>` wrapper with `flex flex-col gap-6`. Auto-reduces gap for checkbox/radio groups |",
          "| `FieldLegend` | `<legend>` element with `variant` prop (`\"legend\"` \\| `\"label\"`) controlling text size via `data-[variant=*]` |",
          "| `FieldGroup` | Vertical stack with `gap-7` and `@container/field-group` for responsive field layouts |",
          "| `Field` | Core wrapper using `fieldVariants` CVA. `orientation`: `\"vertical\"` \\| `\"horizontal\"` \\| `\"responsive\"`. Sets `data-orientation` and `role=\"group\"` |",
          "| `FieldContent` | Inner container for input + description in horizontal layouts, styled `flex-1 flex-col gap-1.5` |",
          "| `FieldLabel` | Wraps `<Label>` with field-aware styling. Supports nested field composition and checked-state border highlight |",
          "| `FieldTitle` | Non-label title alternative styled `text-sm font-medium` |",
          "| `FieldDescription` | Helper text styled `text-muted-foreground text-sm pl-2` with auto-styled links |",
          "| `FieldSeparator` | Horizontal rule with optional centered text content via `<Separator>` |",
          "| `FieldError` | Validation error (`role=\"alert\"`, `text-destructive`). Accepts `errors` array for multiple messages or `children` for single |",
          "",
          "## Key details",
          "",
          "- Field `responsive` orientation uses `@container` queries (`@md/field-group`) to switch from vertical to horizontal",
          "- FieldError deduplicates error messages and renders a `<ul>` list when multiple errors exist, plain text for single",
          "- FieldLabel highlights with `border-primary bg-primary/5` when containing a checked checkbox/radio via `has-data-[state=checked]`",
          "- Disabled state propagates via `group-data-[disabled=true]/field` reducing opacity",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <Field {...args} className="w-full min-w-[300px] max-w-xs">
      <FieldLabel htmlFor="username-field">Nome de usuário</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput id="username-field" placeholder="Digite seu nome de usuário" />
        </InputGroup>
      </FieldContent>
      <FieldDescription>Este é seu nome de exibição público.</FieldDescription>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Nome de usuário")).toBeInTheDocument();

    const input = canvas.getByPlaceholderText("Digite seu nome de usuário");
    await expect(input).toBeInTheDocument();

    const label = canvas.getByText("Nome de usuário");
    await expect(label.closest("label")).toHaveAttribute("for", "username-field");
    await expect(input).toHaveAttribute("id", "username-field");

    await expect(
      canvas.getByText("Este é seu nome de exibição público.")
    ).toBeInTheDocument();

    const field = canvasElement.querySelector('[data-slot="field"]');
    await expect(field).toHaveAttribute("data-orientation", "vertical");
  },
};

export const WithError: Story = {
  render: () => (
    <Field className="w-full min-w-[300px] max-w-xs">
      <FieldLabel>E-mail</FieldLabel>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
        <InputGroupInput placeholder="nome@exemplo.com" aria-invalid="true" />
      </InputGroup>
      <FieldError>Por favor, insira um e-mail válido.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("E-mail")).toBeInTheDocument();

    const input = canvas.getByPlaceholderText("nome@exemplo.com");
    await expect(input).toHaveAttribute("aria-invalid", "true");

    const error = canvas.getByRole("alert");
    await expect(error).toBeInTheDocument();
    await expect(error).toHaveTextContent("Por favor, insira um e-mail válido.");
    await expect(error).toHaveAttribute("data-slot", "field-error");
  },
};

export const WithErrorList: Story = {
  render: () => (
    <Field className="w-full min-w-[300px] max-w-xs">
      <FieldLabel>Senha</FieldLabel>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmLockSolidIcon /></InputGroupAddon>
        <InputGroupInput type="password" placeholder="Digite sua senha" aria-invalid="true" />
      </InputGroup>
      <FieldError
        errors={[
          { message: "Mínimo de 8 caracteres" },
          { message: "Deve conter uma letra maiúscula" },
          { message: "Deve conter um número" },
        ]}
      />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const error = canvas.getByRole("alert");
    await expect(error).toBeInTheDocument();

    await expect(canvas.getByText("Mínimo de 8 caracteres")).toBeInTheDocument();
    await expect(canvas.getByText("Deve conter uma letra maiúscula")).toBeInTheDocument();
    await expect(canvas.getByText("Deve conter um número")).toBeInTheDocument();

    const list = error.querySelector("ul");
    await expect(list).toBeInTheDocument();
    await expect(list?.querySelectorAll("li")).toHaveLength(3);
  },
};

export const WithErrorSingleFromArray: Story = {
  render: () => (
    <Field className="w-full min-w-[300px] max-w-xs">
      <FieldLabel>Nome</FieldLabel>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
        <InputGroupInput placeholder="Digite seu nome" aria-invalid="true" />
      </InputGroup>
      <FieldError errors={[{ message: "Campo obrigatório" }]} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const error = canvas.getByRole("alert");
    await expect(error).toBeInTheDocument();
    await expect(error).toHaveTextContent("Campo obrigatório");

    // Single error should NOT render a list
    const list = error.querySelector("ul");
    await expect(list).toBeNull();
  },
};

export const WithErrorEmpty: Story = {
  render: () => (
    <Field className="w-full min-w-[300px] max-w-xs">
      <FieldLabel>Nome</FieldLabel>
      <InputGroup>
        <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
        <InputGroupInput placeholder="Digite seu nome" />
      </InputGroup>
      <FieldError errors={[]} />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // FieldError with empty errors array should not render
    const error = canvasElement.querySelector('[data-slot="field-error"]');
    await expect(error).toBeNull();

    await expect(canvas.getByPlaceholderText("Digite seu nome")).toBeInTheDocument();
  },
};

export const WithErrorSelect: Story = {
  render: () => (
    <Field className="w-full min-w-[300px] max-w-xs">
      <FieldLabel>País</FieldLabel>
      <Select>
        <SelectTrigger aria-invalid="true">
          <SelectValue placeholder="Selecione um país" />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" sideOffset={4}>
          <SelectItem value="br">Brasil</SelectItem>
          <SelectItem value="pt">Portugal</SelectItem>
          <SelectItem value="us">Estados Unidos</SelectItem>
        </SelectContent>
      </Select>
      <FieldError>Por favor, selecione um país.</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const error = canvas.getByRole("alert");
    await expect(error).toHaveTextContent("Por favor, selecione um país.");
  },
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-full min-w-[300px] max-w-md">
      <FieldLabel>Nome</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Digite seu nome" />
        </InputGroup>
      </FieldContent>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const field = canvasElement.querySelector('[data-slot="field"]');
    await expect(field).toHaveAttribute("data-orientation", "horizontal");

    const fieldContent = canvasElement.querySelector('[data-slot="field-content"]');
    await expect(fieldContent).toBeInTheDocument();

    const input = canvas.getByPlaceholderText("Digite seu nome");
    await userEvent.type(input, "João");
    await expect(input).toHaveValue("João");
  },
};

export const WithFieldTitle: Story = {
  render: () => (
    <Field className="w-full min-w-[300px] max-w-xs">
      <FieldTitle>Informações adicionais</FieldTitle>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmSearchLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Digite aqui" />
        </InputGroup>
      </FieldContent>
      <FieldDescription>Use este campo para informações extras.</FieldDescription>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const title = canvas.getByText("Informações adicionais");
    await expect(title).toBeInTheDocument();
    await expect(title).toHaveAttribute("data-slot", "field-label");

    await expect(canvas.getByText("Use este campo para informações extras.")).toBeInTheDocument();

    const input = canvas.getByPlaceholderText("Digite aqui");
    await userEvent.type(input, "Teste");
    await expect(input).toHaveValue("Teste");
  },
};

export const WithFieldGroup: Story = {
  render: () => (
    <FieldGroup className="w-full min-w-[300px] max-w-xs">
      <Field className="w-full">
        <FieldLabel>Primeiro nome</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Ex: João" />
        </InputGroup>
      </Field>
      <Field className="w-full">
        <FieldLabel>Sobrenome</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Ex: Silva" />
        </InputGroup>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldGroup = canvasElement.querySelector('[data-slot="field-group"]');
    await expect(fieldGroup).toBeInTheDocument();

    const firstName = canvas.getByPlaceholderText("Ex: João");
    const lastName = canvas.getByPlaceholderText("Ex: Silva");

    await userEvent.type(firstName, "João");
    await expect(firstName).toHaveValue("João");

    await userEvent.type(lastName, "Silva");
    await expect(lastName).toHaveValue("Silva");
  },
};

export const WithFieldSet: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Dados pessoais</FieldLegend>
      <Field className="w-full max-w-xs">
        <FieldLabel>Nome completo</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Digite seu nome completo" />
        </InputGroup>
      </Field>
      <Field className="w-full max-w-xs">
        <FieldLabel>E-mail</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
          <InputGroupInput type="email" placeholder="nome@exemplo.com" />
        </InputGroup>
      </Field>
    </FieldSet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldset = canvasElement.querySelector('[data-slot="field-set"]');
    await expect(fieldset).toBeInTheDocument();
    await expect(fieldset?.tagName.toLowerCase()).toBe("fieldset");

    const legend = canvasElement.querySelector('[data-slot="field-legend"]');
    await expect(legend).toBeInTheDocument();
    await expect(legend).toHaveTextContent("Dados pessoais");
    await expect(legend).toHaveAttribute("data-variant", "legend");

    const nameInput = canvas.getByPlaceholderText("Digite seu nome completo");
    await userEvent.type(nameInput, "Maria Souza");
    await expect(nameInput).toHaveValue("Maria Souza");
  },
};

export const WithFieldLegendLabelVariant: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend variant="label">Endereço</FieldLegend>
      <Field className="w-full max-w-xs">
        <FieldLabel>Rua</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Nome da rua" />
        </InputGroup>
      </Field>
    </FieldSet>
  ),
  play: async ({ canvasElement }) => {
    const legend = canvasElement.querySelector('[data-slot="field-legend"]');
    await expect(legend).toBeInTheDocument();
    await expect(legend).toHaveAttribute("data-variant", "label");
    await expect(legend).toHaveTextContent("Endereço");
  },
};

export const WithFieldSeparator: Story = {
  render: () => (
    <FieldGroup className="w-full min-w-[300px] max-w-xs">
      <Field>
        <FieldLabel>Nome</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Primeiro nome" />
        </InputGroup>
      </Field>
      <FieldSeparator />
      <Field>
        <FieldLabel>Sobrenome</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Último nome" />
        </InputGroup>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const separator = canvasElement.querySelector('[data-slot="field-separator"]');
    await expect(separator).toBeInTheDocument();

    await expect(canvas.getByPlaceholderText("Primeiro nome")).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText("Último nome")).toBeInTheDocument();
  },
};

export const WithFieldSeparatorContent: Story = {
  render: () => (
    <FieldGroup className="w-full min-w-[300px] max-w-xs">
      <Field>
        <FieldLabel>E-mail</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmMailSolidIcon /></InputGroupAddon>
          <InputGroupInput placeholder="nome@exemplo.com" />
        </InputGroup>
      </Field>
      <FieldSeparator>ou</FieldSeparator>
      <Field>
        <FieldLabel>Telefone</FieldLabel>
        <InputGroup>
          <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
          <InputGroupInput placeholder="(11) 99999-9999" />
        </InputGroup>
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const separator = canvasElement.querySelector('[data-slot="field-separator"]');
    await expect(separator).toBeInTheDocument();
    await expect(separator).toHaveAttribute("data-content", "true");

    const separatorContent = canvasElement.querySelector('[data-slot="field-separator-content"]');
    await expect(separatorContent).toBeInTheDocument();
    await expect(separatorContent).toHaveTextContent("ou");

    const emailInput = canvas.getByPlaceholderText("nome@exemplo.com");
    await userEvent.type(emailInput, "teste@email.com");
    await expect(emailInput).toHaveValue("teste@email.com");
  },
};

export const AllOrientations: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-md">
      {(["vertical", "horizontal", "responsive"] as const).map(
        (orientation) => (
          <div key={orientation} className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-heading">
              {orientation}
            </span>
            <Field orientation={orientation}>
              <FieldLabel>Nome completo</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start"><SmProfileLineIcon /></InputGroupAddon>
                  <InputGroupInput placeholder="Digite seu nome completo" />
                </InputGroup>
                <FieldDescription>
                  Orientação: {orientation}
                </FieldDescription>
              </FieldContent>
            </Field>
          </div>
        )
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fields = canvasElement.querySelectorAll('[data-slot="field"]');
    await expect(fields).toHaveLength(3);

    await expect(fields[0]).toHaveAttribute("data-orientation", "vertical");
    await expect(fields[1]).toHaveAttribute("data-orientation", "horizontal");
    await expect(fields[2]).toHaveAttribute("data-orientation", "responsive");
  },
};
