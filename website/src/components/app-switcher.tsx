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
  MdBoltSolidIcon,
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
  { name: "Overlens", href: "https://plataforma.overlens.com.br", icon: <OverlensSymbol />, external: true },
  { name: "Brand System", href: "/docs", icon: <MdDocSolidIcon /> },
  { name: "Website", href: "https://overlens.com.br", icon: <MdLanguageLineIcon />, external: true },
  { name: "Pacote Cultural", href: "/pacote", icon: <MdLibrarySolidIcon /> },
  { name: "Growth System", href: "/growth", icon: <MdChartLineIcon /> },
  { name: "Content System", href: "/estudio", icon: <MdCognitionLineIcon /> },
  { name: "Assets", href: "/assets", icon: <MdFolderSolidIcon /> },
  { name: "Botões Mágicos", href: "/ferramentas", icon: <MdBoltSolidIcon /> },
];

export function AppSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const sorted = [...apps].sort((a, b) => {
    const aExternal = "external" in a && a.external;
    const bExternal = "external" in b && b.external;
    const aAccess = aExternal || (user ? canAccessRoute(user.role, a.href) : true);
    const bAccess = bExternal || (user ? canAccessRoute(user.role, b.href) : true);
    if (aAccess === bAccess) return 0;
    return aAccess ? -1 : 1;
  });

  return (
    <TopbarApps open={open} onOpenChange={setOpen} className="pt-2">
      <TopbarAppsContent>
        {sorted.map((app) => {
          const isExternal = "external" in app && app.external;
          const isActive = !isExternal && pathname.startsWith(app.href);
          const hasAccess = isExternal || (user ? canAccessRoute(user.role, app.href) : true);
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
                if (isExternal) {
                  window.open(app.href, "_blank", "noopener");
                } else {
                  router.push(app.href);
                }
              }}
            />
          );
        })}
      </TopbarAppsContent>
    </TopbarApps>
  );
}
