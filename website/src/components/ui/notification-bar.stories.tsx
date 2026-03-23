import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { SmNotificationSolidIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { TopbarNotifications } from "./topbar";
import {
  NotificationBar,
  NotificationBarContent,
  NotificationBarHeader,
  NotificationBarTitle,
  NotificationBarResolveAll,
  NotificationBarClearAll,
  NotificationBarBody,
  NotificationBarFooter,
  NotificationBarTabs,
  NotificationBarTabContent,
} from "./notification-bar";
import {
  NotificationCard,
  NotificationCardCover,
  NotificationCardHeader,
  NotificationCardAvatar,
  NotificationCardTitle,
  NotificationCardIcon,
  NotificationCardStatus,
  NotificationCardDescription,
  NotificationCardActions,
} from "./notification-card";
import type { NotificationCardVariant } from "./notification-card";

const meta = {
  title: "Core Components/NotificationBar",
  tags: ["autodocs"],
  component: NotificationBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Popover dropdown de notificacoes ancorado ao icone de sino, construido sobre Radix UI Popover. Gerencia estado de leitura, concluir todas e marcar como lidas via React context. Suporta navegacao por abas (Inbox / Geral).",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<TopbarNotifications>",
          "  <NotificationBarContent>",
          "    <NotificationBarHeader>",
          "      <NotificationBarTitle>Notificacoes</NotificationBarTitle>",
          "      <div className=\"flex items-center gap-0.5\">",
          "        <NotificationBarClearAll />",
          "        <NotificationBarResolveAll />",
          "      </div>",
          "    </NotificationBarHeader>",
          "    <NotificationBarTabs>",
          "      <NotificationBarTabContent value=\"inbox\">",
          "        <NotificationBarBody emptyState={<EmptyState />}>",
          "          <NotificationCard variant=\"post\" unread>",
          "            ...compound components...",
          "          </NotificationCard>",
          "        </NotificationBarBody>",
          "      </NotificationBarTabContent>",
          "      <NotificationBarTabContent value=\"general\">",
          "        <NotificationBarBody>...</NotificationBarBody>",
          "      </NotificationBarTabContent>",
          "    </NotificationBarTabs>",
          "  </NotificationBarContent>",
          "</TopbarNotifications>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `NotificationBar` | Root provider (Radix `Popover.Root`). Gerencia `open`, `unreadIds`, `allRead` e `cleared`. Integrado automaticamente no `TopbarNotifications`. |",
          "| `NotificationBarContent` | Portal + painel popover. Largura `w-80`, alinhado ao fim do trigger. Background `var(--surface-950)`. |",
          "| `NotificationBarHeader` | Linha flex com titulo e botoes de acao. |",
          "| `NotificationBarTitle` | Heading `<h2>` com `text-base font-semibold`. |",
          "| `NotificationBarTabs` | Navegacao por abas (Inbox com badge de contagem / Geral). |",
          "| `NotificationBarTabContent` | Painel de conteudo para cada aba. |",
          "| `NotificationBarClearAll` | Botao ghost (`SmCheckLineIcon`, `size-5`) com tooltip \"Concluir todas\". Chama `clearAll()` - esconde cards e exibe empty state permanentemente. |",
          "| `NotificationBarResolveAll` | Botao ghost (`SmHistoryLineIcon`, `size-5`) com tooltip \"Marcar como lidas\". Badge brand-atmos quando `unreadCount > 0`. Chama `markAllAsRead()`. |",
          "| `NotificationBarBody` | Container scrollavel (`gap-2.5`). Aceita `emptyState` prop exibido quando `cleared` e `true`. Scrollbar customizada via webkit. |",
          "",
          "## Key details",
          "",
          "- Hook `useNotificationBar()` expoe: `open`, `onOpenChange`, `allRead`, `markAllAsRead`, `cleared`, `clearAll`, `unreadCount`, `registerUnread`, `markAsRead`.",
          "- Tracking de nao-lidos usa `Set<string>` de card IDs via `registerUnread` e `markAsRead`.",
          "- Popover fecha automaticamente ao clicar fora - sem overlay bloqueante.",
          "- `NotificationBarBody` alterna entre `children` e `emptyState` baseado no flag `cleared`.",
          "- Todas as stories incluem Topbar com trigger para permitir reabrir apos fechar.",
          "",
          "## NotificationCard",
          "",
          "- **Max-width**: Designed for narrow containers (popover is `w-80`). When used outside the bar (e.g. showcase), wrap in `max-w-2xl` so cards don't stretch full viewport width.",
          "- **NotificationCardHeader**: Gap between title and time is always `gap-5` - never reduce with responsive overrides.",
          "- **NotificationCardAvatar**: Layout slot for avatar images. Place inside `NotificationCardHeader` before the title.",
          "- **Anatomy**: `NotificationCard` > `NotificationCardHeader` > (`NotificationCardTitle` > (`NotificationCardIcon` + text) + `NotificationCardTime`) + `NotificationCardDescription`.",
          "- **Variant icon placement**: `NotificationCardIcon` renders the correct icon from context (based on `variant` prop) - always place it **inside** `NotificationCardTitle` as the first child, never as a sibling of the header.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Whether the notification bar is open by default (uncontrolled)",
      table: { defaultValue: { summary: "false" } },
    },
    open: {
      control: "boolean",
      description: "Controlled open state of the notification bar",
    },
    onOpenChange: {
      control: false,
      description: "Callback fired when the open state changes",
    },
    children: {
      control: false,
      description: "NotificationBarTrigger and NotificationBarContent elements",
    },
  },
} satisfies Meta<typeof NotificationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function MentionTag({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--surface-200)]">{children}</span>;
}

type NotificationData = {
  id: string
  title: string
  description: React.ReactNode
  time: Date
  hasCover: boolean
  actions: string[]
  unread: boolean
  variant: NotificationCardVariant
}

const socialNotifications: NotificationData[] = [
  {
    id: "s1",
    title: "Maria comentou no seu post",
    description: "Adorei a nova feature! Ficou incrível.",
    time: new Date(),
    hasCover: false,
    actions: ["Responder"],
    unread: true,
    variant: "comment",
  },
  {
    id: "s2",
    title: "João começou a te seguir",
    description: "Vocês têm 5 conexões em comum.",
    time: new Date(Date.now() - 86400000),
    hasCover: false,
    actions: [],
    unread: true,
    variant: "follow",
  },
  {
    id: "s3",
    title: "Ana mencionou você",
    description: "Olha esse projeto incrível do @você!",
    time: new Date(Date.now() - 86400000 * 2),
    hasCover: false,
    actions: ["Ver post"],
    unread: false,
    variant: "mention",
  },
];

function renderNotification(notif: NotificationData) {
  return (
    <NotificationCard key={notif.id} unread={notif.unread} variant={notif.variant}>
      {notif.hasCover && (
        <NotificationCardCover className="bg-[var(--brand-atmos)]" />
      )}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <NotificationCardHeader>
            <NotificationCardTitle>
              <NotificationCardIcon />
              {notif.title}
            </NotificationCardTitle>
            <NotificationCardStatus date={notif.time} />
          </NotificationCardHeader>
          <NotificationCardDescription>
            {notif.description}
          </NotificationCardDescription>
        </div>
        {notif.actions.length > 0 && (
          <NotificationCardActions>
            {notif.actions.map((action, i) => (
              <Button
                key={action}
                variant={i === 0 ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
              >
                <span>{action}</span>
              </Button>
            ))}
          </NotificationCardActions>
        )}
      </div>
    </NotificationCard>
  )
}

function SocialNotificationList() {
  return <>{socialNotifications.map(renderNotification)}</>
}

const emptyState = (
  <div className="flex flex-col items-center gap-3 text-center pb-10">
    <SmNotificationSolidIcon className="size-10 text-muted-foreground/40" />
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-muted-foreground">
        Nenhuma notificação
      </p>
      <p className="text-xs text-muted-foreground/60">
        Você está em dia com tudo.
      </p>
    </div>
  </div>
);

const systemNotifications: NotificationData[] = [
  {
    id: "g1",
    title: "Nova trilha disponível",
    description: "A trilha de React Avançado já está liberada para você.",
    time: new Date(),
    hasCover: true,
    actions: ["Ver trilha"],
    unread: true,
    variant: "post",
  },
  {
    id: "g2",
    title: "Atualização de termos",
    description: "Os termos de uso foram atualizados. Revise as mudanças.",
    time: new Date(Date.now() - 86400000 * 2),
    hasCover: false,
    actions: [],
    unread: false,
    variant: "system",
  },
  {
    id: "g3",
    title: "Manutenção programada",
    description: "Haverá manutenção no servidor dia 05/03 às 02:00.",
    time: new Date(Date.now() - 86400000 * 4),
    hasCover: false,
    actions: [],
    unread: false,
    variant: "system",
  },
  {
    id: "g4",
    title: "Missão completada!",
    description: "Você completou a missão da semana e ganhou 50 fractals.",
    time: new Date(Date.now() - 86400000 * 5),
    hasCover: false,
    actions: [],
    unread: false,
    variant: "achievement",
  },
];

export const Default: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 500 } } },
  render: () => (
    <div className="bg-background relative flex h-screen w-full justify-end p-3">
      <TopbarNotifications>
            <NotificationBarContent>
              <NotificationBarHeader>
                <NotificationBarTitle>Notificações</NotificationBarTitle>
                <div className="flex items-center gap-0.5">
                  <NotificationBarClearAll />
                  <NotificationBarResolveAll />
                </div>
              </NotificationBarHeader>
              <NotificationBarTabs>
                <NotificationBarTabContent value="general">
                  <NotificationBarBody emptyState={emptyState}>
                    {systemNotifications.map(renderNotification)}
                  </NotificationBarBody>
                </NotificationBarTabContent>
                <NotificationBarTabContent value="inbox">
                  <NotificationBarBody emptyState={emptyState}>
                    <SocialNotificationList />
                  </NotificationBarBody>
                </NotificationBarTabContent>
              </NotificationBarTabs>
              <NotificationBarFooter />
            </NotificationBarContent>
      </TopbarNotifications>
    </div>
  ),
  play: async () => {
    const body = within(document.body);
    const bell = body.getByRole("button", { name: "Notificações" });
    await userEvent.click(bell);
    await expect(await body.findByRole("heading", { name: "Notificações" })).toBeInTheDocument();
    await expect(body.getByText("Nova trilha disponível")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  name: "Empty",
  parameters: { docs: { story: { inline: false, iframeHeight: 400 } } },
  render: () => (
    <div className="bg-background relative flex h-screen w-full justify-end p-3">
      <TopbarNotifications>
            <NotificationBarContent>
              <NotificationBarHeader>
                <NotificationBarTitle>Notificações</NotificationBarTitle>
                <div className="flex items-center gap-0.5">
                  <NotificationBarClearAll />
                  <NotificationBarResolveAll />
                </div>
              </NotificationBarHeader>
              <NotificationBarTabs>
                <NotificationBarTabContent value="inbox">
                  <NotificationBarBody className="flex items-center pt-8 pb-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <SmNotificationSolidIcon className="size-10 text-muted-foreground/40" />
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Nenhuma notificação
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          Você está em dia com tudo.
                        </p>
                      </div>
                    </div>
                  </NotificationBarBody>
                </NotificationBarTabContent>
                <NotificationBarTabContent value="general">
                  <NotificationBarBody className="flex items-center pt-8 pb-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <SmNotificationSolidIcon className="size-10 text-muted-foreground/40" />
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Nenhuma notificação
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          Você está em dia com tudo.
                        </p>
                      </div>
                    </div>
                  </NotificationBarBody>
                </NotificationBarTabContent>
              </NotificationBarTabs>
              <NotificationBarFooter />
            </NotificationBarContent>
      </TopbarNotifications>
    </div>
  ),
  play: async () => {
    const body = within(document.body);
    const bell = body.getByRole("button", { name: "Notificações" });
    await userEvent.click(bell);
    await expect(await body.findByRole("heading", { name: "Notificações" })).toBeInTheDocument();
    const emptyMessages = body.getAllByText("Nenhuma notificação");
    await expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
    const subtitles = body.getAllByText("Você está em dia com tudo.");
    await expect(subtitles.length).toBeGreaterThanOrEqual(1);
  },
};

export const ManyNotifications: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 500 } } },
  render: () => {
    const manySocialNotifications: NotificationData[] = [
      ...socialNotifications,
      {
        id: "s4",
        title: "Novo comentário",
        description: <><MentionTag>@joao</MentionTag> deixou um comentário no seu projeto.</>,
        time: new Date(Date.now() - 86400000 * 5),
        hasCover: false,
        actions: ["Responder"],
        unread: true,
        variant: "comment",
      },
      {
        id: "s5",
        title: "Pedro curtiu seu post",
        description: "Seu post sobre Design Systems recebeu 12 curtidas.",
        time: new Date(Date.now() - 86400000 * 7),
        hasCover: false,
        actions: [],
        unread: false,
        variant: "follow",
      },
    ];

    return (
      <div className="bg-background relative flex h-screen w-full justify-end p-3">
        <TopbarNotifications>
              <NotificationBarContent>
                <NotificationBarHeader>
                  <NotificationBarTitle>Notificações</NotificationBarTitle>
                  <div className="flex items-center gap-0.5">
                    <NotificationBarClearAll />
                    <NotificationBarResolveAll />
                  </div>
                </NotificationBarHeader>
                <NotificationBarTabs>
                  <NotificationBarTabContent value="general">
                    <NotificationBarBody emptyState={emptyState}>
                      {systemNotifications.map(renderNotification)}
                    </NotificationBarBody>
                  </NotificationBarTabContent>
                  <NotificationBarTabContent value="inbox">
                    <NotificationBarBody emptyState={emptyState}>
                      {manySocialNotifications.map(renderNotification)}
                    </NotificationBarBody>
                  </NotificationBarTabContent>
                </NotificationBarTabs>
              </NotificationBarContent>
        </TopbarNotifications>
      </div>
    );
  },
  play: async () => {
    const body = within(document.body);
    const bell = body.getByRole("button", { name: "Notificações" });
    await userEvent.click(bell);
    await expect(await body.findByRole("heading", { name: "Notificações" })).toBeInTheDocument();
    await expect(body.getByText("Nova trilha disponível")).toBeInTheDocument();
    await expect(body.getByRole("button", { name: "Marcar como lidas" })).toBeInTheDocument();
  },
};

export const WithAvatar: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 500 } } },
  render: () => (
    <div className="bg-background relative flex h-screen w-full justify-end p-3">
      <TopbarNotifications>
            <NotificationBarContent>
              <NotificationBarHeader>
                <NotificationBarTitle>Notificações</NotificationBarTitle>
                <div className="flex items-center gap-0.5">
                  <NotificationBarClearAll />
                  <NotificationBarResolveAll />
                </div>
              </NotificationBarHeader>
              <NotificationBarTabs>
                <NotificationBarTabContent value="general">
                  <NotificationBarBody emptyState={emptyState}>
                    {systemNotifications.map(renderNotification)}
                  </NotificationBarBody>
                </NotificationBarTabContent>
                <NotificationBarTabContent value="inbox">
                  <NotificationBarBody emptyState={emptyState}>
                    <NotificationCard unread variant="comment">
                      <div className="flex items-start gap-2">
                        <NotificationCardAvatar>
                          <Avatar className="size-8">
                            <AvatarImage src="https://i.pravatar.cc/32?u=maria" alt="Maria" />
                            <AvatarFallback>MA</AvatarFallback>
                          </Avatar>
                        </NotificationCardAvatar>
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <NotificationCardHeader>
                            <NotificationCardTitle>
                              Maria comentou
                            </NotificationCardTitle>
                            <NotificationCardStatus date={new Date()} />
                          </NotificationCardHeader>
                          <NotificationCardDescription>
                            Adorei a nova feature! Ficou incrível.
                          </NotificationCardDescription>
                        </div>
                      </div>
                    </NotificationCard>
                    <NotificationCard variant="follow">
                      <div className="flex items-start gap-2">
                        <NotificationCardAvatar>
                          <Avatar className="size-8">
                            <AvatarImage src="https://i.pravatar.cc/32?u=joao" alt="João" />
                            <AvatarFallback>JO</AvatarFallback>
                          </Avatar>
                        </NotificationCardAvatar>
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <NotificationCardHeader>
                            <NotificationCardTitle>
                              João começou a seguir você
                            </NotificationCardTitle>
                            <NotificationCardStatus date={new Date(Date.now() - 86400000)} />
                          </NotificationCardHeader>
                          <NotificationCardDescription>
                            Vocês têm 5 conexões em comum.
                          </NotificationCardDescription>
                        </div>
                      </div>
                    </NotificationCard>
                  </NotificationBarBody>
                </NotificationBarTabContent>
              </NotificationBarTabs>
              <NotificationBarFooter />
            </NotificationBarContent>
      </TopbarNotifications>
    </div>
  ),
  play: async () => {
    const body = within(document.body);
    const bell = body.getByRole("button", { name: "Notificações" });
    await userEvent.click(bell);
    await expect(await body.findByRole("heading", { name: "Notificações" })).toBeInTheDocument();
    await expect(body.getByText("Maria comentou")).toBeInTheDocument();
    await expect(body.getByText("João começou a seguir você")).toBeInTheDocument();
  },
};
