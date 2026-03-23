import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { expect, userEvent, within } from "storybook/test";
import { Toaster } from "./sonner";
import { Button } from "./button";

const meta = {
  title: "Core Components/Sonner",
  tags: ["autodocs"],
  component: Toaster,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Toast notification provider built on the Sonner library with themed styling, semantic icon variants, and action support.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "// Mount the provider once",
          "<Toaster position=\"bottom-right\" />",
          "",
          "// Trigger toasts imperatively",
          "toast.success(\"Saved!\", { description: \"...\" })",
          "toast.error(\"Failed\", { action: { label: \"Retry\", onClick: fn } })",
          "```",
          "",
          "## Props",
          "",
          "| Prop | Type | Default | Description |",
          "|------|------|---------|-------------|",
          "| `position` | `\"top-left\"` \\| `\"top-center\"` \\| `\"top-right\"` \\| `\"bottom-left\"` \\| `\"bottom-center\"` \\| `\"bottom-right\"` | `\"bottom-right\"` | Position of the toast stack |",
          "| `expand` | `boolean` | `false` | Expand all toasts by default |",
          "| `richColors` | `boolean` | `false` | Enable Sonner rich color mode |",
          "| `closeButton` | `boolean` | `true` | Show close button on toasts |",
          "| `duration` | `number` | - | Auto-dismiss duration in ms |",
          "| `visibleToasts` | `number` | - | Max visible toasts at once |",
          "",
          "## Key details",
          "",
          "- Uses `data-slot=\"sonner\"` on the root `Toaster` element.",
          "- Provides custom icons per variant: `SmCheckSolidIcon` (success, `text-success`), `SmInfoSolidIcon` (info, `text-info`), `SmAlertSolidIcon` (warning, `text-warning`), `SmCloseSolidIcon` (error, `text-destructive`), and `Spinner` (loading).",
          "- Toast container uses `bg-popover` with `rounded-xl` and `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`.",
          "- Action and cancel buttons are styled as small pill buttons (`rounded-full h-6`) with `font-heading uppercase tracking-wide`.",
          "- Theme is automatically synced from `next-themes` via `useTheme()`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
      table: { defaultValue: { summary: "bottom-right" } },
    },
    expand: {
      control: "boolean",
    },
    richColors: {
      control: "boolean",
    },
    closeButton: {
      control: "boolean",
      table: { defaultValue: { summary: "true" } },
    },
    duration: {
      control: "text",
    },
    visibleToasts: {
      control: "text",
    },
    theme: {
      control: false,
      description: "Auto-synced from next-themes useTheme() hook. Not manually controllable.",
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster position="bottom-right" />
      </>
    ),
  ],
  args: { position: "bottom-right", closeButton: true, expand: false, richColors: false },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        toast.success("Salvo com sucesso!", {
          description: "Suas alterações foram salvas no banco de dados.",
        })
      }
    >
      Mostrar toast
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: "Mostrar toast" });
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const toastRegion = await within(document.body).findByText("Salvo com sucesso!");
    await expect(toastRegion).toBeInTheDocument();

    const description = within(document.body).getByText("Suas alterações foram salvas no banco de dados.");
    await expect(description).toBeInTheDocument();
  },
};

export const WithActions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.success("Item excluído", {
            description: "O item foi movido para a lixeira.",
            action: {
              label: "Desfazer",
              onClick: () => toast.info("Ação desfeita"),
            },
            cancel: {
              label: "Dispensar",
              onClick: () => {},
            },
          })
        }
      >
        Com ação desfazer
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.error("Falha no envio", {
            description: "O arquivo não pôde ser enviado devido a um erro de rede.",
            action: {
              label: "Tentar novamente",
              onClick: () => toast.info("Tentando novamente..."),
            },
            cancel: {
              label: "Cancelar",
              onClick: () => {},
            },
          })
        }
      >
        Com ação repetir
      </Button>
    </div>
  ),
};

export const Simple: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast("Evento foi criado")}
      >
        Padrão (sem ícone)
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast("Evento criado", {
            description: "Domingo, 03 de dezembro de 2023 às 9:00",
          })
        }
      >
        Com descrição
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const id = toast.loading("Salvando alterações...");
        setTimeout(() => {
          toast.success("Alterações salvas!", { id });
        }, 2000);
      }}
    >
      Carregando → Sucesso
    </Button>
  ),
};

export const PromiseToast: Story = {
  render: () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        toast.promise(
          new Promise<{ name: string }>((resolve) =>
            setTimeout(() => resolve({ name: "Project" }), 2000)
          ),
          {
            loading: "Criando projeto...",
            success: (data) => `${data.name} foi criado!`,
            error: "Falha ao criar projeto",
          }
        )
      }
    >
      Toast com promessa
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.success("Salvo com sucesso!", {
            description: "Suas alterações foram salvas no banco de dados.",
          })
        }
      >
        Sucesso
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.error("Algo deu errado", {
            description: "Falha ao conectar com o servidor. Tente novamente.",
          })
        }
      >
        Erro
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.warning("Revise suas informações", {
            description:
              "Alguns campos contêm dados inválidos que precisam de correção.",
          })
        }
      >
        Aviso
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.info("Nova atualização disponível", {
            description:
              "Versão 2.0 disponível para instalação com novos recursos e melhorias.",
          })
        }
      >
        Informação
      </Button>
    </div>
  ),
};
