import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "./form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Textarea } from "./textarea";
import { Button } from "./button";
import {
  SmMailSolidIcon,
  SmLockSolidIcon,
  SmVisibilitySolidIcon,
  SmVisibilityOffSolidIcon,
  SmProfileLineIcon,
} from "@/components/icons";

const meta = {
  title: "Core Components/Form",
  tags: ["autodocs"],
  component: Form,
  argTypes: {
    children: { control: false },
  },
  args: {},
  parameters: {
    docs: {
      description: {
        component: [
          "React Hook Form integration layer that connects form state, validation, and accessible labeling to UI components.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Form {...form}>",
          "  <form onSubmit={form.handleSubmit(onSubmit)}>",
          "    <FormField",
          "      control={form.control}",
          "      name=\"fieldName\"",
          "      render={({ field }) => (",
          "        <FormItem>",
          "          <FormLabel />",
          "          <FormControl>",
          "            <Input {...field} />",
          "          </FormControl>",
          "          <FormDescription />",
          "          <FormMessage />",
          "        </FormItem>",
          "      )}",
          "    />",
          "  </form>",
          "</Form>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Form` | Re-export of `FormProvider` from react-hook-form for context propagation |",
          "| `FormField` | Wraps `Controller` from react-hook-form, provides `FormFieldContext` with the field name |",
          "| `FormItem` | Container with `grid gap-2` layout and auto-generated `id` via `React.useId()` |",
          "| `FormLabel` | Label that auto-links to the form control via `htmlFor`. Turns red (`text-destructive`) on error via `data-[error=true]` |",
          "| `FormControl` | Radix `Slot` that injects `id`, `aria-describedby`, and `aria-invalid` onto the child input |",
          "| `FormDescription` | Helper text styled `text-muted-foreground text-sm pl-2`, linked via `id` for `aria-describedby` |",
          "| `FormMessage` | Validation error message styled `text-destructive text-sm pl-2`. Auto-reads error from form state, returns `null` when no error |",
          "",
          "## Key details",
          "",
          "- `useFormField` hook provides computed IDs (`formItemId`, `formDescriptionId`, `formMessageId`) and field validation state",
          "- FormControl sets `aria-describedby` to description ID when valid, or both description and message IDs on error",
          "- Requires `zodResolver` from `@hookform/resolvers/zod` for Zod schema validation integration",
          "- FormMessage conditionally renders -- returns null when no error and no children are provided",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const formSchema = z.object({
  username: z.string().min(2, "Nome de usuário deve ter pelo menos 2 caracteres."),
});

function DefaultFormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="w-full max-w-xs space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de usuário</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SmProfileLineIcon />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Overlens" {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>Este é seu nome de exibição público.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => <DefaultFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = await canvas.findByRole("button", { name: "Enviar" });
    const usernameInput = await canvas.findByPlaceholderText("Overlens");

    await userEvent.type(usernameInput, "meuusuario");
    await userEvent.click(submitButton);
  },
};

const validationSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
});

function ValidationFormExample() {
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: { email: "", password: "" },
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="w-full max-w-xs space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SmMailSolidIcon />
                  </InputGroupAddon>
                  <InputGroupInput type="email" placeholder="nome@exemplo.com" {...field} />
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SmLockSolidIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Digite sua senha"
                    {...field}
                  />
                  <button
                    type="button"
                    className="mr-3 cursor-pointer text-[var(--surface-600)]"
                    onClick={() => setPasswordVisible((v) => !v)}
                    aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {passwordVisible ? <SmVisibilityOffSolidIcon /> : <SmVisibilitySolidIcon />}
                  </button>
                </InputGroup>
              </FormControl>
              <FormDescription>Deve ter pelo menos 8 caracteres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Cadastrar</Button>
      </form>
    </Form>
  );
}

export const WithValidation: Story = {
  render: () => <ValidationFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = await canvas.findByRole("button", { name: "Cadastrar" });

    // Submit empty form to trigger validation errors
    await userEvent.click(submitButton);

    // Expect validation messages to appear
    await expect(await canvas.findByText("Por favor, insira um e-mail válido.")).toBeVisible();
    await expect(await canvas.findByText("Senha deve ter pelo menos 8 caracteres.")).toBeVisible();

    // Fill in valid data
    const emailInput = await canvas.findByPlaceholderText("nome@exemplo.com");
    const passwordInput = await canvas.findByPlaceholderText("Digite sua senha");

    await userEvent.type(emailInput, "usuario@exemplo.com");
    await userEvent.type(passwordInput, "senhasegura123");

    // Submit again
    await userEvent.click(submitButton);
  },
};

const multiFieldSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres."),
});

function MultiFieldFormExample() {
  const form = useForm<z.infer<typeof multiFieldSchema>>({
    resolver: zodResolver(multiFieldSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="w-full max-w-sm space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SmProfileLineIcon />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Maria Silva" {...field} />
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SmMailSolidIcon />
                  </InputGroupAddon>
                  <InputGroupInput type="email" placeholder="maria@exemplo.com" {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>Nunca compartilharemos seu e-mail.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea placeholder="Escreva sua mensagem aqui..." {...field} />
              </FormControl>
              <FormDescription>Mínimo de 10 caracteres.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Enviar mensagem</Button>
      </form>
    </Form>
  );
}

export const MultiField: Story = {
  render: () => <MultiFieldFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Submit empty to trigger all validations
    const submitButton = await canvas.findByRole("button", { name: "Enviar mensagem" });
    await userEvent.click(submitButton);

    // Verify all validation messages appear
    await expect(await canvas.findByText("Nome deve ter pelo menos 2 caracteres.")).toBeVisible();
    await expect(await canvas.findByText("Por favor, insira um e-mail válido.")).toBeVisible();
    await expect(await canvas.findByText("Mensagem deve ter pelo menos 10 caracteres.")).toBeVisible();

    // Fill in all fields
    await userEvent.type(await canvas.findByPlaceholderText("Maria Silva"), "Maria Silva");
    await userEvent.type(await canvas.findByPlaceholderText("maria@exemplo.com"), "maria@exemplo.com");
    await userEvent.type(await canvas.findByPlaceholderText("Escreva sua mensagem aqui..."), "Esta é uma mensagem de teste.");

    await userEvent.click(submitButton);
  },
};

const disabledSchema = z.object({
  username: z.string(),
  bio: z.string(),
});

function DisabledFormExample() {
  const form = useForm<z.infer<typeof disabledSchema>>({
    resolver: zodResolver(disabledSchema),
    defaultValues: { username: "usuario_atual", bio: "Desenvolvedor front-end apaixonado por design systems." },
  });

  return (
    <Form {...form}>
      <form className="w-full max-w-xs space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de usuário</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SmProfileLineIcon />
                  </InputGroupAddon>
                  <InputGroupInput disabled placeholder="Overlens" {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>O nome de usuário não pode ser alterado.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea disabled placeholder="Conte sobre você..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled>Salvar</Button>
      </form>
    </Form>
  );
}

export const Disabled: Story = {
  render: () => <DisabledFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const usernameInput = await canvas.findByPlaceholderText("Overlens");
    await expect(usernameInput).toBeDisabled();
    await expect(usernameInput).toHaveValue("usuario_atual");

    const bioInput = await canvas.findByPlaceholderText("Conte sobre você...");
    await expect(bioInput).toBeDisabled();

    const submitButton = await canvas.findByRole("button", { name: "Salvar" });
    await expect(submitButton).toBeDisabled();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full flex-col items-start gap-8 sm:flex-row sm:flex-wrap">
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <p className="text-sm font-medium">Formulário padrão</p>
        <DefaultFormExample />
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <p className="text-sm font-medium">Formulário com validação</p>
        <ValidationFormExample />
      </div>
    </div>
  ),
};
