"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMounted } from "@/lib/use-mounted";
import { useAuth, canAccessRoute } from "@/lib/auth";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MdDocSolidIcon,
  MdCognitionLineIcon,
  MdChartLineIcon,
  MdLibrarySolidIcon,
  SmArrowDownIosLineIcon,
  SmLockLineIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Sistemas navegáveis pelo seletor da sidebar. A ordem aqui é a ordem exibida.
 * O acesso segue as mesmas regras de rota de `canAccessRoute` — os sistemas
 * fechados aparecem desabilitados com cadeado em vez de serem escondidos.
 */
const SYSTEMS = [
  { name: "Brand System", href: "/docs", icon: MdDocSolidIcon },
  { name: "Content System", href: "/estudio", icon: MdCognitionLineIcon },
  { name: "Growth System", href: "/growth", icon: MdChartLineIcon },
  { name: "Pacote Cultural", href: "/pacote", icon: MdLibrarySolidIcon },
] as const;

/** Rotas abertas a qualquer usuário — usadas antes do perfil carregar. */
const PUBLIC_HREFS = new Set<string>(["/docs", "/pacote"]);

export function SystemSwitcher({ basePath }: { basePath: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const hasMounted = useMounted();
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);

  // Enquanto o perfil não carrega, só os sistemas públicos ficam liberados —
  // evita piscar opções que o usuário não pode abrir.
  const hasAccess = (href: string) =>
    hasMounted && user ? canAccessRoute(user.role, href) : PUBLIC_HREFS.has(href);

  const current =
    SYSTEMS.find((s) => basePath === s.href || basePath.startsWith(s.href + "/")) ??
    SYSTEMS[0];
  const CurrentIcon = current.icon;

  // Liberados primeiro, bloqueados no fim — a ordem relativa de cada grupo
  // continua sendo a de SYSTEMS (Array.prototype.sort é estável).
  const ordered = [...SYSTEMS].sort(
    (a, b) => Number(hasAccess(b.href)) - Number(hasAccess(a.href)),
  );

  const trigger = (
    <button
      type="button"
      data-slot="system-switcher"
      className={cn(
        "bg-accent/50 dark:bg-input/30 hover:bg-accent dark:hover:bg-input/50 flex h-12 w-full items-center gap-2 rounded-[8px] px-2 text-sm text-foreground outline-none transition-colors [&>svg]:size-6 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:hover:bg-sidebar-accent",
      )}
    >
      <CurrentIcon />
      <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">
        {current.name}
      </span>
      <SmArrowDownIosLineIcon className="size-5! text-muted-foreground group-data-[collapsible=icon]:hidden" />
    </button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {state === "collapsed" ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {current.name}
          </TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-[220px] bg-[var(--surface-950)]"
      >
        {ordered.map((system) => {
          const allowed = hasAccess(system.href);
          const Icon = allowed ? system.icon : SmLockLineIcon;
          const isCurrent = system.href === current.href;
          return (
            <DropdownMenuItem
              key={system.href}
              disabled={!allowed}
              className={cn("h-10 cursor-pointer", isCurrent && "bg-accent/50")}
              onSelect={() => {
                if (!allowed) return;
                setOpen(false);
                router.push(system.href);
              }}
            >
              <Icon />
              <span className="flex-1">{system.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
