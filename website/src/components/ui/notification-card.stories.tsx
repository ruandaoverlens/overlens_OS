import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { NotificationBar } from "./notification-bar";
import {
  NotificationCard,
  NotificationCardCover,
  NotificationCardHeader,
  NotificationCardTitle,
  NotificationCardIcon,
  NotificationCardStatus,
  NotificationCardDescription,
  NotificationCardActions,
} from "./notification-card";
import type { NotificationCardVariant } from "./notification-card";

const meta = {
  title: "Core Components/NotificationCard",
  tags: ["autodocs"],
  component: NotificationCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Notification card component with variant-based icons, unread state with animated border, cover image, and contextual actions. Requires a parent `NotificationBar` context provider.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<NotificationCard unread variant=\"post\">",
          "  <NotificationCardCover src=\"...\" />",
          "  <NotificationCardHeader>",
          "    <NotificationCardTitle>",
          "      <NotificationCardIcon />",
          "      Title text",
          "    </NotificationCardTitle>",
          "    <NotificationCardStatus date={new Date()} />",
          "  </NotificationCardHeader>",
          "  <NotificationCardDescription>Description text</NotificationCardDescription>",
          "  <NotificationCardActions>",
          "    <Button>Action</Button>",
          "  </NotificationCardActions>",
          "</NotificationCard>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `NotificationCard` | Root card container. Accepts `unread` (default `false`) and `variant` (default `\"system\"`). Uses `data-slot=\"notification-card\"` and `data-unread`. Marks as read on `pointerEnter`. Unread cards display an animated conic-gradient border via `border-travel` keyframe. |",
          "| `NotificationCardCover` | Optional cover image area (`h-24 rounded-[6px]`). Accepts `src` and `alt` props for an `<img>`, or use as a div with custom background. |",
          "| `NotificationCardHeader` | Flex row for title and status (`justify-between`). |",
          "| `NotificationCardTitle` | Truncated title with ellipsis. Shows native `title` attribute on overflow. |",
          "| `NotificationCardIcon` | Renders the variant-mapped icon from context. Maps: `follow`/`mention` = `SmProfileLineIcon`, `comment` = `SmChatSolidIcon`, `post` = `SmDocSolidIcon`, `like` = `SmFavoriteSolidIcon`, `achievement` = `SmCrownSolidIcon`, `system` = `SmNotificationSolidIcon`. |",
          "| `NotificationCardStatus` | Shows \"Nao lida\" + brand-atmos dot when unread, or relative time label when read. |",
          "| `NotificationCardTime` | Standalone time display. Accepts `date` for auto-formatting or `children` for manual text. |",
          "| `NotificationCardDescription` | Description paragraph. Truncated to 2 lines (`line-clamp-2`), expands on hover (`hover:line-clamp-none`). |",
          "| `NotificationCardActions` | Flex container for action buttons. |",
          "",
          "## Key details",
          "",
          "- Seven variants: `\"follow\"`, `\"comment\"`, `\"post\"`, `\"like\"`, `\"mention\"`, `\"achievement\"`, `\"system\"`.",
          "- Relative time formatting: today shows time (\"08:32\"), yesterday shows \"Ontem\", this week shows weekday name, older shows short date (\"03/02/26\").",
          "- Card integrates with `NotificationBar` context via `useNotificationBar()` for `registerUnread` and `markAsRead`.",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <NotificationBar>
        <div className="w-[312px]">
          <Story />
        </div>
      </NotificationBar>
    ),
  ],
  argTypes: {
    children: {
      control: false,
      description: "Notification card content (cover, header, description, actions)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for the notification card",
    },
    unread: {
      control: "boolean",
      description: "Whether the notification is unread",
      table: { defaultValue: { summary: "false" } },
    },
    variant: {
      control: "select",
      options: ["follow", "comment", "post", "like", "mention", "achievement", "system"],
      description: "Notification type variant that determines the icon",
      table: { defaultValue: { summary: "system" } },
    },
  },
  args: {},
} satisfies Meta<typeof NotificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function Mention({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--surface-200)]">{children}</span>;
}

export const Default: Story = {
  render: () => (
    <NotificationCard>
      <NotificationCardCover className="bg-[var(--brand-atmos)]" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Começou o Guideline!
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date()} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            Vem participar do nosso encontro semanal ao vivo.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Aceitar</span>
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-xs">
            <span>Recusar</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Começou o Guideline!")).toBeVisible();
    await expect(canvas.getByText("Vem participar do nosso encontro semanal ao vivo.")).toBeVisible();
    const acceptButton = canvas.getByRole("button", { name: /aceitar/i });
    const rejectButton = canvas.getByRole("button", { name: /recusar/i });
    await expect(acceptButton).toBeVisible();
    await expect(rejectButton).toBeVisible();
    await userEvent.click(acceptButton);
  },
};

export const Unread: Story = {
  name: "Unread",
  render: () => (
    <NotificationCard unread variant="post">
      <NotificationCardCover className="bg-[var(--brand-atmos)]" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Começou o Guideline!
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date()} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            Vem participar do nosso encontro semanal ao vivo.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Ver post</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const WithoutCover: Story = {
  name: "Without Cover",
  render: () => (
    <NotificationCard variant="comment">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Novo comentário
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date(Date.now() - 86400000)} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            <Mention>@joao</Mention> deixou um comentário no seu projeto.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Responder</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const Follow: Story = {
  name: "Follow",
  render: () => (
    <NotificationCard variant="follow" unread>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Novo seguidor
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date()} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            <Mention>@maria</Mention> começou a seguir você.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Seguir de volta</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const Comment: Story = {
  name: "Comment",
  render: () => (
    <NotificationCard variant="comment">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Novo comentário
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date(Date.now() - 86400000)} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            <Mention>@joao</Mention> deixou um comentário no seu projeto.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Responder</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const Post: Story = {
  name: "Post",
  render: () => (
    <NotificationCard variant="post" unread>
      <NotificationCardCover className="bg-[var(--brand-atmos)]" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Novo post publicado
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date()} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            <Mention>@ana</Mention> publicou um novo artigo sobre Design Systems.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Ver post</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const Like: Story = {
  name: "Like",
  render: () => (
    <NotificationCard variant="like">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Estrela recebida
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date(Date.now() - 86400000 * 2)} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            <Mention>@pedro</Mention> marcou uma estrela no seu comentário sobre acessibilidade.
          </NotificationCardDescription>
        </div>
      </div>
    </NotificationCard>
  ),
};

export const MentionStory: Story = {
  name: "Mention",
  render: () => (
    <NotificationCard variant="mention" unread>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Você foi mencionado
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date()} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            <Mention>@lucas</Mention> mencionou você em uma discussão sobre tokens.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Ver menção</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const Achievement: Story = {
  name: "Achievement",
  render: () => (
    <NotificationCard variant="achievement">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Conquista desbloqueada!
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date(Date.now() - 86400000 * 3)} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            Você completou 30 dias seguidos de aprendizado.
          </NotificationCardDescription>
        </div>
        <NotificationCardActions>
          <Button size="sm" className="h-6 text-xs">
            <span>Compartilhar</span>
          </Button>
        </NotificationCardActions>
      </div>
    </NotificationCard>
  ),
};

export const System: Story = {
  name: "System",
  render: () => (
    <NotificationCard variant="system">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              Atualização do sistema
            </NotificationCardTitle>
            <NotificationCardStatus date={new Date(2026, 1, 3)} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            Uma nova versão está disponível com melhorias de performance.
          </NotificationCardDescription>
        </div>
      </div>
    </NotificationCard>
  ),
};

const allVariantsData: {
  variant: NotificationCardVariant
  title: string
  description: React.ReactNode
  actions: string[]
  unread: boolean
}[] = [
  { variant: "follow", title: "Novo seguidor", description: <><Mention>@maria</Mention> começou a seguir você.</>, actions: ["Seguir de volta"], unread: true },
  { variant: "comment", title: "Novo comentário", description: <><Mention>@joao</Mention> deixou um comentário no seu projeto.</>, actions: ["Responder"], unread: false },
  { variant: "post", title: "Novo post publicado", description: <><Mention>@ana</Mention> publicou um novo artigo sobre Design Systems.</>, actions: ["Ver post"], unread: true },
  { variant: "like", title: "Estrela recebida", description: <><Mention>@pedro</Mention> marcou uma estrela no seu comentário sobre acessibilidade.</>, actions: [], unread: false },
  { variant: "mention", title: "Você foi mencionado", description: <><Mention>@lucas</Mention> mencionou você em uma discussão sobre tokens.</>, actions: ["Ver menção"], unread: true },
  { variant: "achievement", title: "Conquista desbloqueada!", description: "Você completou 30 dias seguidos de aprendizado.", actions: ["Compartilhar"], unread: false },
  { variant: "system", title: "Atualização do sistema", description: "Uma nova versão está disponível com melhorias de performance.", actions: [], unread: false },
];

export const AllVariants: Story = {
  decorators: [
    (Story) => (
      <NotificationBar>
        <div className="flex flex-wrap items-start gap-4">
          <Story />
        </div>
      </NotificationBar>
    ),
  ],
  render: () => (
    <>
      {allVariantsData.map((item) => (
        <div key={item.variant} className="w-[312px]">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">{item.variant}</h3>
          <NotificationCard variant={item.variant} unread={item.unread}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <NotificationCardHeader>
                  <NotificationCardTitle>
                    <NotificationCardIcon />
                    {item.title}
                  </NotificationCardTitle>
                  <NotificationCardStatus date={new Date()} />
                </NotificationCardHeader>
                <NotificationCardDescription>
                  {item.description}
                </NotificationCardDescription>
              </div>
              {item.actions.length > 0 && (
                <NotificationCardActions>
                  {item.actions.map((action) => (
                    <Button key={action} size="sm" className="h-6 text-xs">
                      <span>{action}</span>
                    </Button>
                  ))}
                </NotificationCardActions>
              )}
            </div>
          </NotificationCard>
        </div>
      ))}
    </>
  ),
};
