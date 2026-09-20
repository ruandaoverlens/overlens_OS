"use client";

import { useRouter } from "next/navigation";
import { SmNotificationSolidIcon } from "@/components/icons";
import {
  NotificationBarBody,
  NotificationBarClearAll,
  NotificationBarContent,
  NotificationBarFooter,
  NotificationBarHeader,
  NotificationBarResolveAll,
  NotificationBarTabContent,
  NotificationBarTabs,
  NotificationBarTitle,
} from "@/components/ui/notification-bar";
import {
  NotificationCard,
  NotificationCardDescription,
  NotificationCardHeader,
  NotificationCardIcon,
  NotificationCardStatus,
  NotificationCardTitle,
} from "@/components/ui/notification-card";
import { TopbarNotifications } from "@/components/ui/topbar";
import { EmptyState } from "@/components/empty-state";
import { useNotifications } from "@/lib/notifications";
import type { Notification } from "@/lib/notifications";

const emptyState = (
  <EmptyState
    size="sm"
    className="border-none pb-10"
    icon={<SmNotificationSolidIcon aria-hidden="true" />}
    title="Nenhuma notificação"
    description="Você está em dia com tudo."
  />
);

function isSocial(n: Notification) {
  return n.category === "social";
}

export function AppNotifications() {
  const router = useRouter();
  const { items, unreadCount, markRead } = useNotifications();

  const general = items.filter((n) => !isSocial(n));
  const social = items.filter(isSocial);

  const onClick = (n: Notification) => {
    if (!n.readAt) void markRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const triggerLabel =
    unreadCount > 0
      ? `Notificações, ${unreadCount} não lida${unreadCount === 1 ? "" : "s"}`
      : "Notificações";

  return (
    <TopbarNotifications aria-label={triggerLabel}>
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
              {general.map((n) => (
                <NotificationCard
                  key={n.id}
                  unread={!n.readAt}
                  variant={n.variant}
                  id={n.id}
                  onClick={() => onClick(n)}
                >
                  <div className="flex flex-col gap-2">
                    <NotificationCardHeader>
                      <NotificationCardTitle>
                        <NotificationCardIcon />
                        {n.title}
                      </NotificationCardTitle>
                      <NotificationCardStatus date={new Date(n.createdAt)} />
                    </NotificationCardHeader>
                    {n.description && (
                      <NotificationCardDescription>
                        {n.description}
                      </NotificationCardDescription>
                    )}
                  </div>
                </NotificationCard>
              ))}
            </NotificationBarBody>
          </NotificationBarTabContent>
          <NotificationBarTabContent value="inbox">
            <NotificationBarBody emptyState={emptyState}>
              {social.map((n) => (
                <NotificationCard
                  key={n.id}
                  unread={!n.readAt}
                  variant={n.variant}
                  id={n.id}
                  onClick={() => onClick(n)}
                >
                  <div className="flex flex-col gap-2">
                    <NotificationCardHeader>
                      <NotificationCardTitle>
                        <NotificationCardIcon />
                        {n.title}
                      </NotificationCardTitle>
                      <NotificationCardStatus date={new Date(n.createdAt)} />
                    </NotificationCardHeader>
                    {n.description && (
                      <NotificationCardDescription>
                        {n.description}
                      </NotificationCardDescription>
                    )}
                  </div>
                </NotificationCard>
              ))}
            </NotificationBarBody>
          </NotificationBarTabContent>
        </NotificationBarTabs>
        <NotificationBarFooter />
      </NotificationBarContent>
    </TopbarNotifications>
  );
}
