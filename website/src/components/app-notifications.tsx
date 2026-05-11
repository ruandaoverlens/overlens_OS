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
import { useNotifications } from "@/lib/notifications";
import type { Notification } from "@/lib/notifications";

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

function isSocial(n: Notification) {
  return n.category === "social";
}

export function AppNotifications() {
  const router = useRouter();
  const { items, markRead } = useNotifications();

  const general = items.filter((n) => !isSocial(n));
  const social = items.filter(isSocial);

  const onClick = (n: Notification) => {
    if (!n.readAt) void markRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  return (
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
