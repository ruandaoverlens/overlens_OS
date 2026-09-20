"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMounted } from "@/lib/use-mounted";
import { useAuth, canAccessRoute, type UserRole } from "@/lib/auth";
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
  MdInvoiceSolidIcon,
  MdCognitionLineIcon,
  MdChartLineIcon,
  MdLibrarySolidIcon,
  SmArrowDownIosLineIcon,
  SmCheckLineIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Sistemas navegáveis pelo seletor da sidebar. A ordem aqui é a ordem exibida.
 * O acesso segue as mesmas regras de rota de `canAccessRoute` — os sistemas
 * fechados aparecem desabilitados em vez de serem escondidos.
 */
export const SYSTEMS = [
  { name: "Business Doc", href: "/business", icon: MdInvoiceSolidIcon },
  { name: "Brand System", href: "/docs", icon: MdDocSolidIcon },
  { name: "Content System", href: "/estudio", icon: MdCognitionLineIcon },
  { name: "Growth System", href: "/growth", icon: MdChartLineIcon },
  { name: "Pacote Cultural", href: "/pacote", icon: MdLibrarySolidIcon },
] as const;

export type SystemEntry = (typeof SYSTEMS)[number];

/** Rotas abertas a qualquer usuário — usadas antes do perfil carregar. */
const PUBLIC_HREFS = new Set<string>(["/docs", "/pacote"]);

/**
 * Regra de acesso compartilhada entre o seletor e a command palette:
 * enquanto o perfil não carrega, só os sistemas públicos ficam liberados —
 * evita piscar opções que o usuário não pode abrir.
 */
export function canAccessSystem(
  role: UserRole | null | undefined,
  href: string,
): boolean {
  return role ? canAccessRoute(role, href) : PUBLIC_HREFS.has(href);
}

export function SystemSwitcher({ basePath }: { basePath: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const hasMounted = useMounted();
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);

  const hasAccess = (href: string) =>
    canAccessSystem(hasMounted ? user?.role : null, href);

  const current =
    SYSTEMS.find((s) => basePath === s.href || basePath.startsWith(s.href + "/")) ??
    SYSTEMS.find((s) => s.href === "/docs")!;
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
      aria-label={`Sistema atual: ${current.name}. Trocar de sistema`}
      className={cn(
        "bg-accent/50 dark:bg-input/30 hover:bg-accent dark:hover:bg-input/50 flex h-12 w-full items-center gap-2 rounded-field-sm px-2 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground [&>svg]:size-6 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:hover:bg-sidebar-accent",
      )}
    >
      <CurrentIcon className="hidden group-data-[collapsible=icon]:block" />
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
        className="w-(--radix-dropdown-menu-trigger-width) min-w-[220px] bg-surface-950"
      >
        {ordered.map((system) => {
          const allowed = hasAccess(system.href);
          const isCurrent = system.href === current.href;
          return (
            <DropdownMenuItem
              key={system.href}
              disabled={!allowed}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "h-10 cursor-pointer",
                isCurrent && "bg-accent/50 text-foreground",
              )}
              onSelect={() => {
                if (!allowed) return;
                setOpen(false);
                router.push(system.href);
              }}
            >
              <span className="flex-1">{system.name}</span>
              {/* O fundo sozinho não diferencia do item sob o cursor. */}
              {isCurrent && (
                <SmCheckLineIcon className="size-5 shrink-0" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
