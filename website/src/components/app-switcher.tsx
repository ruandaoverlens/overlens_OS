"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { TopbarApps, TopbarAppsContent, TopbarAppsItem } from "@/components/ui/topbar";
import { useAuth, canAccessRoute, type UserRole } from "@/lib/auth";
import {
  MdFolderSolidIcon,
  MdLanguageLineIcon,
  MdBoltSolidIcon,
  MdGitForkLineIcon,
} from "@/components/icons";
import { SYSTEMS, canAccessSystem } from "@/components/system-switcher";

/** Símbolo da Overlens — tema é dark fixo, então só a versão clara é servida. */
function OverlensSymbol({ className = "size-6" }: { className?: string }) {
  return (
    <Image
      src="/brand/symbol-light.svg"
      alt=""
      width={24}
      height={24}
      className={className}
      aria-hidden="true"
    />
  );
}

export type AppEntry = {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

/**
 * Apps do grid do topbar. Exportado para a command palette reaproveitar a
 * mesma lista (e a mesma regra de acesso via `canAccessApp`).
 */
export const APPS: AppEntry[] = [
  { name: "Área de Estudos", href: "https://plataforma.overlens.com.br", icon: <OverlensSymbol />, external: true },
  { name: "Botões Mágicos", href: "/ferramentas", icon: <MdBoltSolidIcon /> },
  { name: "Assets", href: "/assets", icon: <MdFolderSolidIcon /> },
  { name: "Mycelium", href: "/mycelium", icon: <MdGitForkLineIcon /> },
  { name: "Website", href: "https://overlens.com.br", icon: <MdLanguageLineIcon />, external: true },
];
// Os quatro sistemas de documentação (Brand, Content, Growth, Pacote Cultural)
// saíram do grid: são escolhidos pelo seletor no topo da sidebar (SystemSwitcher).
// "Registros" (/registros) também não aparece aqui — o módulo é interno
// (@overlens.com.br) e é acessado pelo atalho da sidebar ou URL direta.

/** Links externos são sempre liberados; internos seguem `canAccessRoute`. */
export function canAccessApp(role: UserRole | null | undefined, app: AppEntry): boolean {
  if (app.external) return true;
  return role ? canAccessRoute(role, app.href) : true;
}

/** Systems de documentação como entradas do grid (mesma lista do seletor). */
const SYSTEM_ENTRIES: AppEntry[] = SYSTEMS.map((s) => {
  const Icon = s.icon;
  return { name: s.name, href: s.href, icon: <Icon /> };
});

const SYSTEM_HREFS = new Set<string>(SYSTEMS.map((s) => s.href));

/** Systems seguem `canAccessSystem`; apps seguem `canAccessApp`. */
function hasAccess(role: UserRole | null | undefined, app: AppEntry): boolean {
  return SYSTEM_HREFS.has(app.href)
    ? canAccessSystem(role, app.href)
    : canAccessApp(role, app);
}

export function AppSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Todos os systems acessíveis entram no grid (não só o último visitado):
  // é daqui que se volta a um system a partir de Assets, Mycelium ou
  // Ferramentas, e o destino nem sempre é o último que se abriu.
  const entries: AppEntry[] = [...SYSTEM_ENTRIES, ...APPS];

  // Liberados primeiro, bloqueados no fim (sort estável mantém a ordem).
  const sorted = [...entries].sort(
    (a, b) => Number(hasAccess(user?.role, b)) - Number(hasAccess(user?.role, a)),
  );

  return (
    <TopbarApps
      open={open}
      onOpenChange={setOpen}
      className="mr-1 mt-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground"
    >
      <TopbarAppsContent>
        {sorted.map((app) => {
          const isExternal = !!app.external;
          const isActive = !isExternal && pathname.startsWith(app.href);
          const allowed = hasAccess(user?.role, app);
          return (
            <TopbarAppsItem
              key={app.href}
              icon={app.icon}
              label={app.name}
              disabled={!allowed}
              aria-current={isActive ? "page" : undefined}
              className={
                !allowed
                  ? "pointer-events-none [&>span:first-child]:opacity-[0.08] [&>span:last-child]:opacity-30"
                  : isActive
                    ? "bg-accent/50 text-foreground"
                    : ""
              }
              onClick={() => {
                if (!allowed) return;
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
