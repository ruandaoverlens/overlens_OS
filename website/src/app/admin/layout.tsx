import Link from "next/link";
import { Topbar, TopbarBreadcrumb, TopbarActions } from "@/components/ui/topbar";
import { AppSwitcher } from "@/components/app-switcher";
import { AppNotifications } from "@/components/app-notifications";
import { SmArrowBackLineIcon } from "@/components/icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh flex-col">
      <Topbar>
        <TopbarBreadcrumb>
          <Link
            href="/docs"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <SmArrowBackLineIcon className="size-4" />
            <span>Painel Admin</span>
          </Link>
        </TopbarBreadcrumb>
        <TopbarActions>
          <AppNotifications />
          <AppSwitcher />
        </TopbarActions>
      </Topbar>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
