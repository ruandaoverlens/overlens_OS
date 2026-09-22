"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

/**
 * Seletor de tema da topbar. Fica ao lado dos outros ícones fixos, à direita.
 *
 * Três opções em vez de um interruptor de dois estados: sem "Sistema" não há
 * como voltar a seguir o sistema operacional depois de escolher uma vez.
 *
 * O ícone mostra o tema RESOLVIDO (o que está na tela), não o escolhido: em
 * "Sistema" ele acompanha o sistema operacional.
 *
 * `useMounted()` devolve `false` no servidor E na primeira renderização do
 * cliente, então os dois concordam e não há divergência de hidratação. Até lá
 * o botão ocupa o mesmo espaço com um ícone provisório — a topbar não salta.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const hasMounted = useMounted();

  // Antes de montar mostramos a lua: o padrão da plataforma é o tema escuro,
  // então é o ícone certo para a maioria e evita um piscar sol→lua.
  const Icon = !hasMounted ? Moon : resolvedTheme === "dark" ? Moon : Sun;
  const current = hasMounted ? (theme ?? "dark") : "dark";
  const currentLabel =
    OPTIONS.find((o) => o.value === current)?.label ?? "Escuro";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              data-slot="theme-toggle"
              variant="ghost"
              size="icon"
              // `text-muted-foreground`: mesmo peso dos outros ícones fixos da topbar.
              className={cn("text-muted-foreground", className)}
              aria-label={`Tema: ${currentLabel}. Alternar tema`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Tema</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" sideOffset={8} className="w-40">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(value) => setTheme(value)}
        >
          {OPTIONS.map(({ value, label, icon: OptionIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <OptionIcon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
