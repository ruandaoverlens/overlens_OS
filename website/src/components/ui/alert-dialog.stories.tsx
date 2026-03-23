import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { MdAlertSolidIcon, MdInfoSolidIcon } from "@/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogHeaderRow,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import { InputGroup, InputGroupInput } from "./input-group";

const meta = {
  title: "Core Components/AlertDialog",
  tags: ["autodocs"],
  component: AlertDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Modal dialog that requires explicit user confirmation before proceeding. Built on Radix UI AlertDialog.",
          "",
          "## Sizes",
          "",
          "| Size | Behavior |",
          "|------|----------|",
          "| `default` | `max-w-lg` on desktop, full-width with 1rem margin on mobile |",
          "| `sm` | `w-fit` - shrinks to content width |",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<AlertDialog>",
          "  <AlertDialogTrigger asChild>",
          "    <Button>Open</Button>",
          "  </AlertDialogTrigger>",
          "  <AlertDialogContent>",
          "    <AlertDialogHeader>",
          "      <AlertDialogHeaderRow>",
          "        <AlertDialogMedia><Icon /></AlertDialogMedia>",
          "        <AlertDialogTitle>Title</AlertDialogTitle>",
          "        <AlertDialogClose />",
          "      </AlertDialogHeaderRow>",
          "      <AlertDialogBody>",
          "        <AlertDialogDescription>Description</AlertDialogDescription>",
          "      </AlertDialogBody>",
          "    </AlertDialogHeader>",
          "    <AlertDialogFooter>",
          "      <AlertDialogAction>Confirm</AlertDialogAction>",
          "      <AlertDialogCancel>Cancel</AlertDialogCancel>",
          "    </AlertDialogFooter>",
          "  </AlertDialogContent>",
          "</AlertDialog>",
          "```",
          "",
          "## Key details",
          "",
          "- Clicking outside the overlay triggers the Cancel/Close action (not dismiss)",
          "- `AlertDialogMedia` is hidden on mobile (`hidden sm:inline-flex`)",
          "- `AlertDialogAction` and `AlertDialogCancel` accept `variant` and `size` props from `Button`",
          "- Footer buttons stack vertically on mobile, row on desktop (`flex-col-reverse sm:flex-row`)",
          "- `size=\"sm\"` forces footer to always stack vertically",
          "- Supports custom body content (e.g., `Input` for confirmation typing)",
          "- Overlay uses `backdrop-blur-sm` with `bg-black/70`",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado controlado de abertura do diálogo",
    },
    defaultOpen: {
      control: "boolean",
      description: "Estado inicial de abertura (não controlado)",
    },
    onOpenChange: {
      control: false,
      description: "Callback disparado ao abrir/fechar o diálogo",
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Abrir diálogo</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeaderRow>
            <AlertDialogMedia>
              <MdAlertSolidIcon className="text-[var(--surface-200)]" />
            </AlertDialogMedia>
            <AlertDialogTitle>Realmente deseja excluir?</AlertDialogTitle>
            <AlertDialogClose />
          </AlertDialogHeaderRow>
          <AlertDialogBody>
            <AlertDialogDescription>
              Você está prestes a excluir uma aula, essa ação não pode ser
              desfeita. Esta operação é permanente e não poderá ser revertida.
            </AlertDialogDescription>
          </AlertDialogBody>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction size="sm">Confirmar</AlertDialogAction>
          <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Abrir diálogo" });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAttribute("data-slot", "alert-dialog-content");

    await expect(within(dialog).getByText("Realmente deseja excluir?")).toBeInTheDocument();
    await expect(within(dialog).getByText(/prestes a excluir/)).toBeInTheDocument();

    const media = dialog.querySelector('[data-slot="alert-dialog-media"]');
    await expect(media).toBeInTheDocument();

    const body = dialog.querySelector('[data-slot="alert-dialog-body"]');
    await expect(body).toBeInTheDocument();

    const footer = dialog.querySelector('[data-slot="alert-dialog-footer"]');
    await expect(footer).toBeInTheDocument();

    await expect(within(dialog).getByRole("button", { name: "Confirmar" })).toBeInTheDocument();

    const cancel = within(dialog).getByRole("button", { name: "Cancelar" });
    await userEvent.click(cancel);
  },
};

export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Excluir conta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeaderRow>
            <AlertDialogMedia>
              <MdAlertSolidIcon className="text-[var(--surface-200)]" />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogClose />
          </AlertDialogHeaderRow>
          <AlertDialogBody>
            <AlertDialogDescription>
              Isso excluirá permanentemente sua conta. Todos os seus dados serão
              perdidos. Essa ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogBody>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction variant="destructive" size="sm">
            Excluir
          </AlertDialogAction>
          <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Excluir conta" }));

    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(within(dialog).getByText("Excluir conta")).toBeInTheDocument();
    await expect(within(dialog).getByText(/permanentemente sua conta/)).toBeInTheDocument();
    await expect(within(dialog).getByRole("button", { name: "Excluir" })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  },
};

export const WithInput: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Abrir diálogo</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeaderRow>
            <AlertDialogMedia>
              <MdAlertSolidIcon className="text-[var(--surface-200)]" />
            </AlertDialogMedia>
            <AlertDialogTitle>Realmente deseja excluir?</AlertDialogTitle>
            <AlertDialogClose />
          </AlertDialogHeaderRow>
          <AlertDialogBody>
            <AlertDialogDescription>
              Você está prestes a excluir uma aula, essa ação não pode ser
              desfeita. Digite &quot;Excluir permanentemente&quot; e toque em
              confirmar para excluir.
            </AlertDialogDescription>
            <InputGroup><InputGroupInput placeholder="Excluir permanentemente" /></InputGroup>
          </AlertDialogBody>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction size="sm">Confirmar</AlertDialogAction>
          <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Abrir diálogo" }));

    const dialog = await within(document.body).findByRole("alertdialog");
    const input = within(dialog).getByPlaceholderText("Excluir permanentemente");
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, "Excluir permanentemente");
    await expect(input).toHaveValue("Excluir permanentemente");

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  },
};

export const Simple: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Sair</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeaderRow>
            <AlertDialogTitle className="pl-1">Tem certeza que deseja sair?</AlertDialogTitle>
          </AlertDialogHeaderRow>
          <AlertDialogDescription className="pl-1">
            Você precisará entrar novamente para acessar sua conta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction size="sm">Sair</AlertDialogAction>
          <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Sair" }));

    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(within(dialog).getByText("Tem certeza que deseja sair?")).toBeInTheDocument();
    await expect(within(dialog).getByText(/entrar novamente/)).toBeInTheDocument();

    // Simple variant has no media slot
    const media = dialog.querySelector('[data-slot="alert-dialog-media"]');
    await expect(media).toBeNull();

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  },
};

export const InfoDialog: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary">Saiba mais</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeaderRow>
            <AlertDialogMedia>
              <MdInfoSolidIcon className="text-[var(--surface-200)]" />
            </AlertDialogMedia>
            <AlertDialogTitle>Sobre este recurso</AlertDialogTitle>
            <AlertDialogClose />
          </AlertDialogHeaderRow>
          <AlertDialogDescription className="pl-1">
            Este recurso permite gerenciar os membros da sua equipe.
            As alterações serão aplicadas imediatamente em todos os projetos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction size="sm">Entendi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Saiba mais" }));

    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(within(dialog).getByText("Sobre este recurso")).toBeInTheDocument();
    await expect(within(dialog).getByText(/gerenciar os membros/)).toBeInTheDocument();

    // Info dialog has no Cancel button - only confirm
    const action = within(dialog).getByRole("button", { name: "Entendi" });
    await expect(action).toBeInTheDocument();
    await userEvent.click(action);
  },
};

export const SmallSize: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Descartar alterações</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogHeaderRow>
            <AlertDialogMedia>
              <MdAlertSolidIcon className="text-[var(--surface-200)]" />
            </AlertDialogMedia>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
          </AlertDialogHeaderRow>
          <AlertDialogDescription>
            Suas alterações não salvas serão perdidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction size="sm">Descartar</AlertDialogAction>
          <AlertDialogCancel size="sm">Continuar editando</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Descartar alterações" }));

    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(dialog).toHaveAttribute("data-size", "sm");
    await expect(within(dialog).getByText("Descartar alterações?")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Continuar editando" }));
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Padrão</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogHeaderRow>
              <AlertDialogMedia>
                <MdAlertSolidIcon className="text-[var(--surface-200)]" />
              </AlertDialogMedia>
              <AlertDialogTitle>Realmente deseja excluir?</AlertDialogTitle>
              <AlertDialogClose />
            </AlertDialogHeaderRow>
            <AlertDialogBody>
              <AlertDialogDescription>
                Você está prestes a excluir uma aula, essa ação não pode ser
                desfeita. Esta operação é permanente e não poderá ser revertida.
              </AlertDialogDescription>
            </AlertDialogBody>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction size="sm">Confirmar</AlertDialogAction>
            <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Destrutivo</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogHeaderRow>
              <AlertDialogMedia>
                <MdAlertSolidIcon className="text-[var(--surface-200)]" />
              </AlertDialogMedia>
              <AlertDialogTitle>Excluir conta</AlertDialogTitle>
              <AlertDialogClose />
            </AlertDialogHeaderRow>
            <AlertDialogBody>
              <AlertDialogDescription>
                Isso excluirá permanentemente sua conta. Todos os seus dados serão
                perdidos. Essa ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogBody>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction variant="destructive" size="sm">
              Excluir
            </AlertDialogAction>
            <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Com input</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogHeaderRow>
              <AlertDialogMedia>
                <MdAlertSolidIcon className="text-[var(--surface-200)]" />
              </AlertDialogMedia>
              <AlertDialogTitle>Realmente deseja excluir?</AlertDialogTitle>
              <AlertDialogClose />
            </AlertDialogHeaderRow>
            <AlertDialogBody>
              <AlertDialogDescription>
                Você está prestes a excluir uma aula, essa ação não pode ser
                desfeita. Digite &quot;Excluir permanentemente&quot; e toque em
                confirmar para excluir.
              </AlertDialogDescription>
              <InputGroup><InputGroupInput placeholder="Excluir permanentemente" /></InputGroup>
            </AlertDialogBody>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction variant="destructive" size="sm">
              Excluir
            </AlertDialogAction>
            <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Simples</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogHeaderRow>
              <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
            </AlertDialogHeaderRow>
            <AlertDialogDescription>
              Você precisará entrar novamente para acessar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction size="sm">Sair</AlertDialogAction>
            <AlertDialogCancel size="sm">Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary">Informativo</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogHeaderRow>
              <AlertDialogMedia>
                <MdInfoSolidIcon className="text-[var(--surface-200)]" />
              </AlertDialogMedia>
              <AlertDialogTitle>Sobre este recurso</AlertDialogTitle>
              <AlertDialogClose />
            </AlertDialogHeaderRow>
            <AlertDialogDescription className="pl-1">
              Este recurso permite gerenciar os membros da sua equipe.
              As alterações serão aplicadas imediatamente em todos os projetos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction size="sm">Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Tamanho pequeno</Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogHeaderRow>
              <AlertDialogMedia>
                <MdAlertSolidIcon className="text-[var(--surface-200)]" />
              </AlertDialogMedia>
              <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            </AlertDialogHeaderRow>
            <AlertDialogDescription>
              Suas alterações não salvas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction size="sm">Descartar</AlertDialogAction>
            <AlertDialogCancel size="sm">Continuar editando</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
};
