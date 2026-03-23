import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  Topbar,
  TopbarActions,
  TopbarBreadcrumb,
  TopbarFractals,
  TopbarStreak,
  TopbarNotifications,
  TopbarRanking,
  TopbarSearch,
  TopbarApps,
  TopbarAppsContent,
  TopbarAppsItem,
} from "./topbar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import {
  NotificationBarContent,
  NotificationBarHeader,
  NotificationBarTitle,
  NotificationBarResolveAll,
  NotificationBarClearAll,
  NotificationBarBody,
  NotificationBarTabs,
  NotificationBarTabContent,
  NotificationBarFooter,
} from "./notification-bar";
import {
  NotificationCard,
  NotificationCardHeader,
  NotificationCardTitle,
  NotificationCardTime,
  NotificationCardDescription,
  NotificationCardIcon,
} from "./notification-card";
import {
  MdChatSolidIcon,
  MdShopSolidIcon,
  MdDocSolidIcon,
  SmNotificationSolidIcon,
} from "@/components/icons";

const emptyState = (
  <div className="flex flex-col items-center gap-3 text-center">
    <SmNotificationSolidIcon className="size-10 text-muted-foreground/40" />
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-muted-foreground">Nenhuma notificação</p>
      <p className="text-xs text-muted-foreground/60">Você está em dia com tudo.</p>
    </div>
  </div>
);

function DemoNotificationContent() {
  return (
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
            <NotificationCard variant="achievement">
              <NotificationCardHeader>
                <NotificationCardTitle>
                  <NotificationCardIcon />
                  Nova trilha disponível
                </NotificationCardTitle>
                <NotificationCardTime>30 min atrás</NotificationCardTime>
              </NotificationCardHeader>
              <NotificationCardDescription>
                A trilha &quot;Design Systems Avançado&quot; acabou de ser publicada.
              </NotificationCardDescription>
            </NotificationCard>
            <NotificationCard variant="achievement">
              <NotificationCardHeader>
                <NotificationCardTitle>
                  <NotificationCardIcon />
                  Conquista desbloqueada
                </NotificationCardTitle>
                <NotificationCardTime>1 hora atrás</NotificationCardTime>
              </NotificationCardHeader>
              <NotificationCardDescription>
                Você completou 100 componentes. Continue construindo!
              </NotificationCardDescription>
            </NotificationCard>
          </NotificationBarBody>
        </NotificationBarTabContent>
        <NotificationBarTabContent value="inbox">
          <NotificationBarBody emptyState={emptyState}>
            <NotificationCard variant="comment" unread>
              <NotificationCardHeader>
                <NotificationCardTitle>
                  <NotificationCardIcon />
                  Novo comentário no seu post
                </NotificationCardTitle>
                <NotificationCardTime>2 min atrás</NotificationCardTime>
              </NotificationCardHeader>
              <NotificationCardDescription>
                Alice comentou: &quot;Ótimo trabalho no design system!&quot;
              </NotificationCardDescription>
            </NotificationCard>
          </NotificationBarBody>
        </NotificationBarTabContent>
      </NotificationBarTabs>
      <NotificationBarFooter />
    </NotificationBarContent>
  );
}

const meta = {
  title: "Core Components/Topbar",
  tags: ["autodocs"],
  component: Topbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Full-width sticky top navigation bar with breadcrumb on the left and action buttons on the right.",
          "",
          "## Anatomy",
          "",
          "```tsx",
          "<Topbar>",
          "  <TopbarBreadcrumb>",
          "    <Breadcrumb>...</Breadcrumb>",
          "  </TopbarBreadcrumb>",
          "  <TopbarActions>",
          "    <TopbarRanking />",
          "    <TopbarNotifications>",
          "      <NotificationBarContent>",
          "        <NotificationBarHeader>",
          "          <NotificationBarTitle>Notificações</NotificationBarTitle>",
          "          <NotificationBarClearAll />",
          "          <NotificationBarResolveAll />",
          "        </NotificationBarHeader>",
          "        <NotificationBarTabs>",
          "          <NotificationBarTabContent value=\"general\">",
          "            <NotificationBarBody>...</NotificationBarBody>",
          "          </NotificationBarTabContent>",
          "          <NotificationBarTabContent value=\"inbox\">",
          "            <NotificationBarBody>...</NotificationBarBody>",
          "          </NotificationBarTabContent>",
          "        </NotificationBarTabs>",
          "        <NotificationBarFooter />",
          "      </NotificationBarContent>",
          "    </TopbarNotifications>",
          "    <TopbarStreak count={7} />",
          "    <TopbarFractals count={1469} />",
          "    <TopbarApps>",
          "      <TopbarAppsContent>",
          "        <TopbarAppsItem icon={<MdChatSolidIcon />} label=\"Overchat\" />",
          "        <TopbarAppsItem icon={<MdShopSolidIcon />} label=\"Artefatos\" />",
          "        <TopbarAppsItem icon={<MdDocSolidIcon />} label=\"Magny\" />",
          "      </TopbarAppsContent>",
          "    </TopbarApps>",
          "  </TopbarActions>",
          "</Topbar>",
          "```",
          "",
          "## Sub-components",
          "",
          "| Sub-component | Description |",
          "|---------------|-------------|",
          "| `Topbar` | `<header>` element with `sticky top-0 z-30 h-12 w-full justify-between`. Contains breadcrumb and actions. |",
          "| `TopbarBreadcrumb` | Left-aligned container for breadcrumb navigation. |",
          "| `TopbarActions` | Flex container (`gap-1`) grouping action buttons. |",
          "| `TopbarStreak` | Button displaying a numeric `count` (Ofensiva/streak) with a `MdBoltSolidIcon`. Uses `font-mono tabular-nums`. |",
          "| `TopbarFractals` | Button displaying a numeric `count` (formatted via `toLocaleString()`) with a `SmAsteriskLineIcon`. Uses `font-mono tabular-nums`. |",
          "| `TopbarNotifications` | Ghost `Button` with `SmNotificationLineIcon` → `SmNotificationSolidIcon` on hover/open. Wraps `NotificationBar` provider - pass full `NotificationBarContent` (with Tabs, Footer) as children. Shows pulse badge when `unreadCount > 0`. |",
          "| `TopbarRanking` | Ghost `Button` with `SmCrownLineIcon` → `SmCrownSolidIcon` on hover via `group-hover/rank`. |",
          "| `TopbarApps` | Button with `MdAppsLineIcon` (size-7) that opens a Popover apps grid. Pass `TopbarAppsContent` with `TopbarAppsItem` children. |",
          "| `TopbarAppsContent` | Popover content panel with a 3-column grid layout (`w-[280px]`, `bg-[var(--surface-950)]`). |",
          "| `TopbarAppsItem` | Single app cell - large icon (`size-7`) with a truncated label underneath. Accepts `icon` (ReactNode) and `label` (string). |",
          "",
          "## NotificationBar integration",
          "",
          "`TopbarNotifications` is a thin wrapper around `NotificationBar`. The dropdown content comes entirely from `notification-bar.tsx` sub-components:",
          "",
          "- `NotificationBarContent` - popover panel (`bg-[var(--surface-950)]`, `w-80`)",
          "- `NotificationBarHeader` + `NotificationBarTitle` - title row with ClearAll / ResolveAll buttons",
          "- `NotificationBarTabs` - tab navigation (Geral / Amigos with unread badge)",
          "- `NotificationBarTabContent` - tab panels containing `NotificationBarBody` with `NotificationCard` items",
          "- `NotificationBarFooter` - \"Ver tudo\" link at the bottom",
          "",
          "If the NotificationBar matrix changes, the topbar dropdown updates automatically.",
          "",
          "## Apps launcher",
          "",
          "`TopbarApps` wraps a `Popover` with a 3-column grid of `TopbarAppsItem` cells (Google Workspace style). Each item has a large icon and a truncated label. Current apps: Overchat, Artefatos, Magny.",
          "",
          "## Key details",
          "",
          "- All action buttons use `text-muted-foreground` with `hover:text-foreground` transitions",
          "- Notification and ranking icons swap between line/solid variants on hover using Tailwind group modifiers",
          "- Fractals and Streak buttons use `rounded-full` with `hover:bg-accent` background and `font-mono tabular-nums`",
          "- Uses `data-slot` attributes: `topbar`, `topbar-actions`, `topbar-streak`, `topbar-fractals`, `topbar-notifications`, `topbar-ranking`, `topbar-apps`, `topbar-apps-grid`, `topbar-apps-item`",
          "",
          "## Layout details",
          "",
          "- **Background**: Mobile `bg-[var(--surface-black)]` (solid). Desktop `bg-background/70 backdrop-blur-xl` - semi-transparent with blur.",
          "- **Sidebar edge shadow**: `md:shadow-[inset_3rem_0_2rem_-1rem_oklch(0_0_0)]` - soft inset shadow on the left side (desktop only) to blend sidebar-to-topbar transition.",
          "- **Padding**: `pr-3` always; `md:pl-5` desktop only - no vertical padding (`h-12` + `items-center` handles centering).",
          "- **Mobile behavior**: `TopbarBreadcrumb` is `hidden md:flex` (hidden on mobile). Mobile shows only action icons right-aligned (`justify-end`). Desktop uses `md:justify-between`.",
          "- **Mobile hamburger**: sidebar hamburger (`fixed top-3 left-3 z-50`) visually occupies the left side on mobile.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: "Topbar content, typically TopbarActions with action buttons",
    },
    className: {
      control: "text",
      description: "Additional CSS classes applied to the header element",
    },
  },
  args: {},
} satisfies Meta<typeof Topbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="relative flex h-48 w-full items-start overflow-hidden">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--surface-900),var(--surface-900)_40px,var(--surface-800)_40px,var(--surface-800)_80px)]" />
      <Topbar className="relative inset-auto">
        <TopbarBreadcrumb>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Showcase</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TopbarBreadcrumb>
        <TopbarActions>
          <TopbarSearch />
          <TopbarRanking />
          <TopbarNotifications>
              <DemoNotificationContent />
            </TopbarNotifications>
          <TopbarStreak count={7} />
              <TopbarFractals count={1469} />
          <TopbarApps>
            <TopbarAppsContent>
              <TopbarAppsItem icon={<MdChatSolidIcon />} label="Overchat" />
              <TopbarAppsItem icon={<MdShopSolidIcon />} label="Artefatos" />
              <TopbarAppsItem icon={<MdDocSolidIcon />} label="Magny" />
            </TopbarAppsContent>
          </TopbarApps>
        </TopbarActions>
      </Topbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const banner = canvas.getByRole("banner");
    await expect(banner).toBeInTheDocument();

    await expect(canvas.getByText("Ranking")).toBeInTheDocument();
    await expect(canvas.getByText("Notificações")).toBeInTheDocument();
    await expect(canvas.getByText("Apps")).toBeInTheDocument();

    // toLocaleString() format is locale-dependent (1,469 vs 1.469)
    const fractals = canvasElement.querySelector('[data-slot="topbar-fractals"]');
    await expect(fractals).toBeInTheDocument();
  },
};

export const Minimal: Story = {
  render: () => (
    <div className="relative flex h-48 w-full items-start overflow-hidden">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--surface-900),var(--surface-900)_40px,var(--surface-800)_40px,var(--surface-800)_80px)]" />
      <Topbar className="relative inset-auto">
        <TopbarBreadcrumb>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TopbarBreadcrumb>
        <TopbarActions>
          <TopbarSearch />
          <TopbarNotifications>
              <DemoNotificationContent />
            </TopbarNotifications>
          <TopbarApps>
            <TopbarAppsContent>
              <TopbarAppsItem icon={<MdChatSolidIcon />} label="Overchat" />
              <TopbarAppsItem icon={<MdShopSolidIcon />} label="Artefatos" />
              <TopbarAppsItem icon={<MdDocSolidIcon />} label="Magny" />
            </TopbarAppsContent>
          </TopbarApps>
        </TopbarActions>
      </Topbar>
    </div>
  ),
};

export const AllVariants: Story = {
  parameters: { layout: "fullscreen" as const },
  render: () => (
    <div className="flex flex-col gap-8 w-full p-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Padrão</h3>
        <div className="relative flex h-48 w-full items-start overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--surface-900),var(--surface-900)_40px,var(--surface-800)_40px,var(--surface-800)_80px)]" />
          <Topbar className="relative inset-auto">
            <TopbarBreadcrumb>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </TopbarBreadcrumb>
            <TopbarActions>
              <TopbarRanking />
              <TopbarNotifications>
              <DemoNotificationContent />
            </TopbarNotifications>
              <TopbarStreak count={7} />
              <TopbarFractals count={1469} />
              <TopbarApps>
            <TopbarAppsContent>
              <TopbarAppsItem icon={<MdChatSolidIcon />} label="Overchat" />
              <TopbarAppsItem icon={<MdShopSolidIcon />} label="Artefatos" />
              <TopbarAppsItem icon={<MdDocSolidIcon />} label="Magny" />
            </TopbarAppsContent>
          </TopbarApps>
            </TopbarActions>
          </Topbar>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Mínimo</h3>
        <div className="relative flex h-48 w-full items-start overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,var(--surface-900),var(--surface-900)_40px,var(--surface-800)_40px,var(--surface-800)_80px)]" />
          <Topbar className="relative inset-auto">
            <TopbarBreadcrumb>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </TopbarBreadcrumb>
            <TopbarActions>
              <TopbarNotifications>
              <DemoNotificationContent />
            </TopbarNotifications>
              <TopbarApps>
                <TopbarAppsContent>
                  <TopbarAppsItem icon={<MdChatSolidIcon />} label="Overchat" />
                  <TopbarAppsItem icon={<MdShopSolidIcon />} label="Artefatos" />
                  <TopbarAppsItem icon={<MdDocSolidIcon />} label="Magny" />
                </TopbarAppsContent>
              </TopbarApps>
            </TopbarActions>
          </Topbar>
        </div>
      </div>
    </div>
  ),
};
