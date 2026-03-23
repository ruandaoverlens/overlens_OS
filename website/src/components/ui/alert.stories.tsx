import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  MdAlertSolidIcon,
  MdCheckSolidIcon,
  MdCloseSolidIcon,
  MdInfoSolidIcon,
} from "@/components/icons";
import {
  Alert,
  AlertAction,
  AlertActions,
  AlertClose,
  AlertDescription,
  AlertHeader,
  AlertIcon,
  AlertTitle,
} from "./alert";

const meta = {
  title: "Base Components/Alert",
  tags: ["autodocs"],
  component: Alert,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Compound dismissible alert component with semantic color variants and optional action buttons. Uses CVA for variant styling.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Alert variant=\"success\">",
          "  <AlertHeader>",
          "    <AlertIcon><MdCheckSolidIcon /></AlertIcon>",
          "    <AlertTitle>Title</AlertTitle>",
          "    <AlertClose />",
          "  </AlertHeader>",
          "  <AlertDescription>Body text</AlertDescription>",
          "  <AlertActions>",
          "    <AlertAction>Confirm</AlertAction>",
          "    <AlertAction variant=\"secondary\">Undo</AlertAction>",
          "  </AlertActions>",
          "</Alert>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Alert` | Root container with `role=\"alert\"` and `data-slot=\"alert\"`. Applies `bg-surface-950` with a gradient overlay. Variants: `default`, `destructive`, `warning`, `info`, `success` |",
          "| `AlertHeader` | Flex row for icon, title, and close button |",
          "| `AlertIcon` | Container whose nested SVG color is set by the alert variant via `[&_[data-slot=alert-icon]>svg]` selector |",
          "| `AlertTitle` | Title text using `font-body` and `text-sm` |",
          "| `AlertDescription` | Body text in `text-muted-foreground` with left padding |",
          "| `AlertClose` | Close button rendering `SmCloseLineIcon`. Has `aria-label=\"Close\"` |",
          "| `AlertActions` | Flex row container for action buttons |",
          "| `AlertAction` | Pill-shaped button (`rounded-full`, `h-6`). Accepts `variant` prop: `\"primary\"` (bg-foreground/10) or `\"secondary\"` (transparent) |",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm mx-auto">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "warning", "info", "success"],
    },
  },
  args: { variant: "default" },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertHeader>
        <AlertIcon>
          <MdCheckSolidIcon />
        </AlertIcon>
        <AlertTitle>Exemplo de título</AlertTitle>
        <AlertClose />
      </AlertHeader>
      <AlertDescription>
        Aqui vem uma descrição marota, daquelas bem curtinhas mesmo.
      </AlertDescription>
      <AlertActions>
        <AlertAction>Confirmar</AlertAction>
        <AlertAction variant="secondary">Desfazer</AlertAction>
      </AlertActions>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertHeader>
        <AlertIcon>
          <MdCloseSolidIcon />
        </AlertIcon>
        <AlertTitle>Exemplo de título</AlertTitle>
        <AlertClose />
      </AlertHeader>
      <AlertDescription>
        Aqui vem uma descrição marota, daquelas bem curtinhas mesmo.
      </AlertDescription>
      <AlertActions>
        <AlertAction>Confirmar</AlertAction>
        <AlertAction variant="secondary">Desfazer</AlertAction>
      </AlertActions>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertHeader>
        <AlertIcon>
          <MdAlertSolidIcon />
        </AlertIcon>
        <AlertTitle>Exemplo de título</AlertTitle>
        <AlertClose />
      </AlertHeader>
      <AlertDescription>
        Aqui vem uma descrição marota, daquelas bem curtinhas mesmo.
      </AlertDescription>
      <AlertActions>
        <AlertAction>Confirmar</AlertAction>
        <AlertAction variant="secondary">Desfazer</AlertAction>
      </AlertActions>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <AlertHeader>
        <AlertIcon>
          <MdInfoSolidIcon />
        </AlertIcon>
        <AlertTitle>Exemplo de título</AlertTitle>
        <AlertClose />
      </AlertHeader>
      <AlertDescription>
        Aqui vem uma descrição marota, daquelas bem curtinhas mesmo.
      </AlertDescription>
      <AlertActions>
        <AlertAction>Confirmar</AlertAction>
        <AlertAction variant="secondary">Desfazer</AlertAction>
      </AlertActions>
    </Alert>
  ),
};

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertHeader>
        <AlertIcon>
          <MdInfoSolidIcon />
        </AlertIcon>
        <AlertTitle>Atenção!</AlertTitle>
        <AlertClose />
      </AlertHeader>
      <AlertDescription>
        Você pode adicionar componentes ao app usando o CLI.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const alert = canvasElement.querySelector('[role="alert"]');
    await expect(alert).toBeInTheDocument();

    await expect(canvas.getByText("Atenção!")).toBeVisible();
    await expect(
      canvas.getByText("Você pode adicionar componentes ao app usando o CLI.")
    ).toBeVisible();

    const closeButton = canvas.getByRole("button", { name: "Close" });
    await expect(closeButton).toBeInTheDocument();
  },
};

export const WithoutClose: Story = {
  render: () => (
    <Alert variant="info">
      <AlertHeader>
        <AlertIcon>
          <MdInfoSolidIcon />
        </AlertIcon>
        <AlertTitle>Nova atualização disponível</AlertTitle>
      </AlertHeader>
      <AlertDescription>
        Versão 2.0 disponível com novos recursos e melhorias.
      </AlertDescription>
    </Alert>
  ),
};

export const WithoutActions: Story = {
  render: () => (
    <Alert variant="success">
      <AlertHeader>
        <AlertIcon>
          <MdCheckSolidIcon />
        </AlertIcon>
        <AlertTitle>Alterações salvas</AlertTitle>
        <AlertClose />
      </AlertHeader>
      <AlertDescription>
        Suas alterações foram salvas com sucesso.
      </AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm mx-auto">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert variant="default">
        <AlertHeader>
          <AlertIcon>
            <MdInfoSolidIcon />
          </AlertIcon>
          <AlertTitle>Padrão</AlertTitle>
          <AlertClose />
        </AlertHeader>
        <AlertDescription>Você pode adicionar componentes ao app usando o CLI.</AlertDescription>
        <AlertActions>
          <AlertAction>Confirmar</AlertAction>
          <AlertAction variant="secondary">Desfazer</AlertAction>
        </AlertActions>
      </Alert>
      <Alert variant="success">
        <AlertHeader>
          <AlertIcon>
            <MdCheckSolidIcon />
          </AlertIcon>
          <AlertTitle>Sucesso</AlertTitle>
          <AlertClose />
        </AlertHeader>
        <AlertDescription>Operação concluída com sucesso.</AlertDescription>
        <AlertActions>
          <AlertAction>Confirmar</AlertAction>
          <AlertAction variant="secondary">Desfazer</AlertAction>
        </AlertActions>
      </Alert>
      <Alert variant="destructive">
        <AlertHeader>
          <AlertIcon>
            <MdCloseSolidIcon />
          </AlertIcon>
          <AlertTitle>Erro</AlertTitle>
          <AlertClose />
        </AlertHeader>
        <AlertDescription>Algo deu errado. Por favor, tente novamente.</AlertDescription>
        <AlertActions>
          <AlertAction>Confirmar</AlertAction>
          <AlertAction variant="secondary">Desfazer</AlertAction>
        </AlertActions>
      </Alert>
      <Alert variant="warning">
        <AlertHeader>
          <AlertIcon>
            <MdAlertSolidIcon />
          </AlertIcon>
          <AlertTitle>Aviso</AlertTitle>
          <AlertClose />
        </AlertHeader>
        <AlertDescription>Revise suas informações antes de continuar.</AlertDescription>
        <AlertActions>
          <AlertAction>Confirmar</AlertAction>
          <AlertAction variant="secondary">Desfazer</AlertAction>
        </AlertActions>
      </Alert>
      <Alert variant="info">
        <AlertHeader>
          <AlertIcon>
            <MdInfoSolidIcon />
          </AlertIcon>
          <AlertTitle>Informação</AlertTitle>
          <AlertClose />
        </AlertHeader>
        <AlertDescription>Uma nova versão está disponível para download.</AlertDescription>
        <AlertActions>
          <AlertAction>Confirmar</AlertAction>
          <AlertAction variant="secondary">Desfazer</AlertAction>
        </AlertActions>
      </Alert>
    </div>
  ),
};
