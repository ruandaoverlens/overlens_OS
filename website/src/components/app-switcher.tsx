"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopbarApps, TopbarAppsContent, TopbarAppsItem } from "@/components/ui/topbar";
import { useAuth, canAccessRoute } from "@/lib/auth";
import {
  MdDocSolidIcon,
  MdCognitionLineIcon,
  MdChartLineIcon,
  MdLibrarySolidIcon,
  MdFolderSolidIcon,
  MdLanguageLineIcon,
  MdToolSolidIcon,
  MdInvoiceSolidIcon,
} from "@/components/icons";

function OverlensSymbol() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/symbol-light.svg" alt="" className="size-6 hidden dark:block" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/symbol-dark.svg" alt="" className="size-6 dark:hidden" />
    </>
  );
}

const apps = [
  { name: "Assets", href: "/assets", icon: <MdFolderSolidIcon /> },
  { name: "Brand System", href: "/docs", icon: <MdDocSolidIcon /> },
  { name: "Códices", href: "/codices", icon: <MdInvoiceSolidIcon /> },
  { name: "Content System", href: "/estudio", icon: <MdCognitionLineIcon /> },
  { name: "Growth System", href: "/growth", icon: <MdChartLineIcon /> },
  { name: "Pacote Cultural", href: "/pacote", icon: <MdLibrarySolidIcon /> },
  { name: "Plata", href: "/plataforma", icon: <OverlensSymbol /> },
  { name: "T.R.U", href: "/tru", icon: <MdToolSolidIcon /> },
  { name: "Website", href: "/website", icon: <MdLanguageLineIcon /> },
];

export function AppSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const sorted = [...apps].sort((a, b) => {
    const aAccess = user ? canAccessRoute(user.role, a.href) : true;
    const bAccess = user ? canAccessRoute(user.role, b.href) : true;
    if (aAccess === bAccess) return 0;
    return aAccess ? -1 : 1;
  });

  return (
    <TopbarApps open={open} onOpenChange={setOpen}>
      <TopbarAppsContent>
        {sorted.map((app) => {
          const isActive = pathname.startsWith(app.href);
          const hasAccess = user ? canAccessRoute(user.role, app.href) : true;
          return (
            <TopbarAppsItem
              key={app.href}
              icon={app.icon}
              label={app.name}
              disabled={!hasAccess}
              className={
                !hasAccess
                  ? "pointer-events-none [&>span:first-child]:opacity-[0.08] [&>span:last-child]:opacity-30"
                  : isActive
                    ? "bg-accent/50 text-foreground"
                    : ""
              }
              onClick={() => {
                if (!hasAccess) return;
                setOpen(false);
                router.push(app.href);
              }}
            />
          );
        })}
      </TopbarAppsContent>
    </TopbarApps>
  );
}
