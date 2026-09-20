"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCommandState } from "cmdk";
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import {
  SmAdd2LineIcon,
  SmDocLineIcon,
  SmFolderLineIcon,
  SmGitForkLineIcon,
  SmMessageCircleLineIcon,
  SmRegisteredLineIcon,
  SmSearchLineIcon,
  SmArrowOutwardLineIcon,
  SmFavoriteLineIcon,
  SmToolSolidIcon,
  SmHelpLineIcon,
} from "@/components/icons";
import { useAuth, canAccessRoute } from "@/lib/auth";
import { useMounted } from "@/lib/use-mounted";
import { isOverlensEmail } from "@/lib/route-access";
import { flattenForCitation, type CitableSection } from "@/lib/citable-sections";
import { assetCategories } from "@/lib/assets";
import { SYSTEMS, canAccessSystem } from "@/components/system-switcher";
import { APPS, canAccessApp } from "@/components/app-switcher";
import { REGISTROS_NAV_ITEMS } from "@/lib/registros-nav";
import { useHasDocPagination } from "@/components/doc-pagination";
import type {
  ChatConversationLink,
  NavSection,
  SidebarLink,
} from "@/components/doc-sidebar";
import { cn } from "@/lib/utils";

// ─── Ferramentas (rotas estáticas de /ferramentas) ──────

export const FERRAMENTAS: { title: string; href: string }[] = [
  { title: "Gerador de QR Code", href: "/ferramentas/qr-code" },
  { title: "Otimizador de Imagens", href: "/ferramentas/otimizador-imagens" },
  { title: "Conversor de Cores", href: "/ferramentas/conversor-cores" },
  { title: "Conversor de Formato", href: "/ferramentas/conversor-formato" },
  { title: "Otimizador de Prompts", href: "/ferramentas/otimizador-prompts" },
  { title: "Calculadora de Tempo", href: "/ferramentas/calculadora-tempo" },
];

// ─── Estado compartilhado (botão ↔ palette) ─────────────

type PaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PaletteContext = React.createContext<PaletteContextValue | null>(null);

/**
 * Compartilha o estado `open` entre a `<CommandPalette>` (irmã de `<Sidebar>`,
 * para montar também no mobile) e o `<CommandPaletteButton>` (dentro do
 * `SidebarContent`).
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

function usePaletteContext(): PaletteContextValue | null {
  return React.useContext(PaletteContext);
}

// ─── Atalhos globais ─────────────────────────────────────

/** Editor de texto rico (Tiptap) — Ctrl+K lá é "inserir link". */
function isContentEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.isContentEditable;
}

/**
 * Ctrl/⌘+K abre ou fecha a palette (exceto dentro de contentEditable);
 * Ctrl/⌘+Shift+O abre uma nova conversa. Registrado uma vez, pela palette.
 */
function useCommandPaletteShortcut(toggle: () => void, onNewConversation: () => void) {
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "k" && !e.shiftKey && !e.altKey) {
        if (isContentEditableTarget(e.target)) return;
        e.preventDefault();
        toggle();
      } else if (key === "o" && e.shiftKey && !e.altKey) {
        // Mesma guarda do "k": dentro do editor (Tiptap) navegar para
        // /chat/new descartaria edições não salvas — `router.push` não
        // dispara `beforeunload`.
        if (isContentEditableTarget(e.target)) return;
        e.preventDefault();
        onNewConversation();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle, onNewConversation]);
}

/** "⌘" no Mac, "Ctrl" no resto — decidido só depois de montar (SSR neutro). */
function useModifierLabel(): string {
  const [label, setLabel] = React.useState("⌘");
  React.useEffect(() => {
    // `navigator.platform` está deprecado; userAgentData é o substituto e o
    // userAgent cobre os navegadores que ainda não o implementam.
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const platform = nav.userAgentData?.platform ?? navigator.userAgent;
    setLabel(/Mac|iPhone|iPad|iPod/i.test(platform) ? "⌘" : "Ctrl");
  }, []);
  return label;
}

// ─── Abertura fora do provider (topbar) ──────────────────

const OPEN_EVENT = "overlens:open-command-palette";

/**
 * Abre a palette de qualquer lugar da árvore. O `CommandPaletteProvider` vive
 * dentro das sidebars, enquanto a topbar (e o botão de busca do mobile) é irmã
 * delas — o evento cobre esse caso sem hoistar o provider em todos os layouts.
 */
export function openCommandPalette(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

// ─── Botão da sidebar ────────────────────────────────────

export function CommandPaletteButton({
  onOpen,
  className,
}: {
  /** Opcional quando há `CommandPaletteProvider` acima. */
  onOpen?: () => void;
  className?: string;
}) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const modifier = useModifierLabel();
  const ctx = usePaletteContext();

  const handleOpen = () => {
    // No mobile a sidebar é um drawer; fecha antes de abrir a palette.
    if (isMobile) setOpenMobile(false);
    if (onOpen) onOpen();
    else if (ctx) ctx.setOpen(true);
    else openCommandPalette();
  };

  const button = (
    <button
      type="button"
      data-slot="command-palette-button"
      aria-label="Buscar (Ctrl+K)"
      aria-keyshortcuts="Control+K Meta+K"
      onClick={handleOpen}
      className={cn(
        "bg-accent/50 dark:bg-input/30 hover:bg-accent dark:hover:bg-input/50 flex h-10 w-full min-w-0 items-center gap-2 rounded-field-sm px-2 text-sm text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground [&>svg]:size-5 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:hover:bg-sidebar-accent",
        className,
      )}
    >
      <SmSearchLineIcon />
      <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">
        Buscar…
      </span>
      <KbdGroup
        aria-hidden="true"
        className="hidden sm:inline-flex group-data-[collapsible=icon]:!hidden"
      >
        <Kbd className="bg-surface-900 text-surface-500">{modifier}</Kbd>
        <Kbd className="bg-surface-900 text-surface-500">K</Kbd>
      </KbdGroup>
    </button>
  );

  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          Buscar ({modifier}K)
        </TooltipContent>
      </Tooltip>
    );
  }
  return button;
}

/**
 * Versão só-ícone da busca, para a topbar. Aparece exatamente quando a sidebar
 * não oferece a própria busca: no mobile (a sidebar é um drawer e a busca
 * ficaria a dois toques) e no desktop enquanto a sidebar está recolhida — ela
 * recolhe sozinha abaixo de 1180px, faixa em que um `md:hidden` deixava a
 * busca sem nenhum botão visível.
 *
 * `sidebarCollapsesToIcon` para as rotas cuja sidebar recolhe em modo `icon`:
 * lá o botão de busca continua visível na própria sidebar e este viraria
 * duplicata — no mobile, porém, o drawer some e ele volta a ser necessário.
 *
 * Os layouts montam a topbar fora do `CommandPaletteProvider`, então este botão
 * usa `openCommandPalette()` quando não há contexto acima.
 */
export function CommandPaletteIconButton({
  className,
  sidebarCollapsesToIcon = false,
}: {
  className?: string;
  sidebarCollapsesToIcon?: boolean;
}) {
  const ctx = usePaletteContext();
  const modifier = useModifierLabel();
  const { isMobile, state } = useSidebar();

  const visible = isMobile || (!sidebarCollapsesToIcon && state === "collapsed");
  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Buscar (Ctrl+K)"
      aria-keyshortcuts="Control+K Meta+K"
      onClick={() => (ctx ? ctx.setOpen(true) : openCommandPalette())}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      title={`Buscar (${modifier}K)`}
    >
      <SmSearchLineIcon className="size-6" />
    </Button>
  );
}

/** Botão "+" (Nova conversa) usado ao lado da busca nas sidebars de módulo. */
export function NewConversationButton({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
        >
          <Link href="/chat/new" aria-label="Nova conversa" aria-keyshortcuts="Control+Shift+O Meta+Shift+O">
            <SmAdd2LineIcon className="size-6" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Nova conversa (Ctrl+Shift+O)</TooltipContent>
    </Tooltip>
  );
}

// ─── Tipos ───────────────────────────────────────────────

/** Índice de páginas de um system, calculado no servidor pelos layouts. */
export type SystemPagesIndex = {
  system: string;
  title: string;
  basePath: string;
  sections: CitableSection[];
};

export type ConversationsInput =
  | ChatConversationLink[]
  | Promise<ChatConversationLink[]>;

/**
 * Fonte de dados da palette nas sidebars de módulo (Assets, Mycelium,
 * Registros): páginas do último system visitado + índice de todos os systems.
 */
export type PaletteSource = {
  sections: NavSection[];
  basePath: string;
  title: string;
  allSections?: SystemPagesIndex[];
  conversations?: ConversationsInput;
};

type CommandPaletteProps = {
  /** Opcionais quando há `CommandPaletteProvider` acima. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sections?: NavSection[];
  basePath: string;
  /** Nome do system atual — vira o cabeçalho do grupo "Páginas". */
  title: string;
  conversations?: ConversationsInput;
  footerLinks?: SidebarLink[];
  adminLinks?: SidebarLink[];
  /** Páginas dos demais systems acessíveis (grupo por system, só na busca). */
  allSections?: SystemPagesIndex[];
};

const RECENT_CONVERSATIONS = 5;

/** Atalhos globais listados nas sugestões (`{mod}` vira ⌘ ou Ctrl). */
const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["{mod}", "K"], label: "Abrir a busca" },
  { keys: ["{mod}", "Shift", "O"], label: "Nova conversa" },
  { keys: ["{mod}", "B"], label: "Recolher a sidebar" },
  { keys: ["/"], label: "Focar o campo de busca da página" },
];

/** Atalhos que só existem onde há paginação de documento (`DocPagination`). */
const PAGINATION_SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["["], label: "Página anterior" },
  { keys: ["]"], label: "Próxima página" },
];

/**
 * Lista de atalhos nas sugestões. Fora de `CommandGroup` de propósito: são
 * linhas informativas, não itens selecionáveis, e o cmdk esconderia um grupo
 * sem itens.
 */
function ShortcutsHint({ shortcuts }: { shortcuts: { keys: string[]; label: string }[] }) {
  const modifier = useModifierLabel();
  return (
    <div className="p-1 pt-2">
      <div className="px-2 py-1.5 font-heading text-xs uppercase tracking-wide text-muted-foreground">
        Atalhos
      </div>
      <ul className="flex flex-col">
        {shortcuts.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground"
          >
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            <KbdGroup aria-hidden="true">
              {s.keys.map((k, i) => (
                <Kbd key={i} className="bg-surface-900 text-surface-500">
                  {k === "{mod}" ? modifier : k}
                </Kbd>
              ))}
            </KbdGroup>
          </li>
        ))}
      </ul>
    </div>
  );
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);
}

function isPromiseLike<T>(value: unknown): value is Promise<T> {
  return !!value && typeof (value as { then?: unknown }).then === "function";
}

/** Resolve `conversations` (array ou Promise) — suspende enquanto carrega. */
export function useResolvedConversations(
  input: ConversationsInput | undefined,
): ChatConversationLink[] {
  const resolved = isPromiseLike<ChatConversationLink[]>(input)
    ? React.use(input)
    : input;
  return resolved ?? [];
}

// ─── Subgrupos ───────────────────────────────────────────

function ConversationsGroup({
  conversations,
  limit,
  go,
}: {
  conversations: ConversationsInput | undefined;
  limit?: number;
  go: (href: string) => void;
}) {
  const all = useResolvedConversations(conversations);
  const list = limit ? all.slice(0, limit) : all;
  if (list.length === 0) return null;
  return (
    <CommandGroup heading="Conversas recentes">
      {list.map((c) => (
        <CommandItem
          key={c.id}
          value={`conversa ${c.title} ${c.id}`}
          onSelect={() => go(`/chat/${c.id}`)}
        >
          <SmMessageCircleLineIcon />
          <span className="truncate">{capitalizeFirst(c.title) || "Sem título"}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

/**
 * Item fixo no fim da lista: sempre que houver texto digitado, oferece levar a
 * busca ao assistente — inclusive quando há resultados (a resposta do
 * assistente costuma ser o que se quer quando a busca só devolve vizinhos).
 */
function AskAssistantItem({ go }: { go: (href: string) => void }) {
  const search = useCommandState((s) => s.search);
  const query = search.trim();
  if (!query) return null;
  return (
    <CommandGroup heading="Assistente" forceMount>
      <CommandItem
        forceMount
        value={`perguntar ${query}`}
        onSelect={() => go(`/chat/new?q=${encodeURIComponent(query)}`)}
      >
        <SmMessageCircleLineIcon />
        <span className="min-w-0 flex-1 truncate">
          Perguntar &ldquo;{query}&rdquo; ao assistente
        </span>
      </CommandItem>
    </CommandGroup>
  );
}

// ─── Palette ─────────────────────────────────────────────

export function CommandPalette({
  open: openProp,
  onOpenChange: onOpenChangeProp,
  sections,
  basePath,
  title,
  conversations,
  footerLinks,
  adminLinks,
  allSections,
}: CommandPaletteProps) {
  const router = useRouter();
  const { user } = useAuth();
  const hasMounted = useMounted();
  const role = hasMounted ? user?.role : null;
  const isOverlens = hasMounted && user ? isOverlensEmail(user.email) : false;
  const isAdmin = hasMounted && user ? canAccessRoute(user.role, "/admin") : false;

  // A lista de atalhos some assim que há texto digitado (ela não é filtrável);
  // este item pesquisável a traz de volta — "atalho" encontra a lista.
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  // "[" / "]" só existem onde uma `DocPagination` está montada com destino
  // real — anunciar por rota deixava o atalho fantasma nas pontas do system.
  const hasPagination = useHasDocPagination();
  const shortcuts = React.useMemo(
    () => (hasPagination ? [...SHORTCUTS, ...PAGINATION_SHORTCUTS] : SHORTCUTS),
    [hasPagination],
  );

  const ctx = usePaletteContext();
  const open = openProp ?? ctx?.open ?? false;
  const onOpenChange = React.useCallback(
    (v: boolean) => {
      if (!v) setShowShortcuts(false);
      if (onOpenChangeProp) onOpenChangeProp(v);
      else ctx?.setOpen(v);
    },
    [onOpenChangeProp, ctx],
  );

  // Botões montados fora do provider (topbar) pedem a abertura por evento.
  React.useEffect(() => {
    const onRequest = () => onOpenChange(true);
    window.addEventListener(OPEN_EVENT, onRequest);
    return () => window.removeEventListener(OPEN_EVENT, onRequest);
  }, [onOpenChange]);

  const toggle = React.useCallback(() => onOpenChange(!open), [open, onOpenChange]);
  const goNewConversation = React.useCallback(() => {
    onOpenChange(false);
    router.push("/chat/new");
  }, [onOpenChange, router]);
  useCommandPaletteShortcut(toggle, goNewConversation);

  const go = React.useCallback(
    (href: string, external = false) => {
      onOpenChange(false);
      if (external) {
        window.open(href, "_blank", "noopener");
      } else {
        router.push(href);
      }
    },
    [onOpenChange, router],
  );

  const pages = React.useMemo(
    () => (sections ? flattenForCitation(sections) : []),
    [sections],
  );

  const canAssets = !!role && canAccessRoute(role, "/assets");
  const canMycelium = !!role && canAccessRoute(role, "/mycelium");
  const canFerramentas = role ? canAccessRoute(role, "/ferramentas") : true;

  // Ações rápidas — só as que o usuário pode abrir.
  const actions = React.useMemo(() => {
    const list: { label: string; href: string; icon: React.ReactNode; shortcut?: string }[] = [
      { label: "Nova conversa", href: "/chat/new", icon: <SmAdd2LineIcon />, shortcut: "Ctrl+Shift+O" },
    ];
    if (canAssets) {
      list.push({ label: "Assets da Marca", href: "/assets", icon: <SmFolderLineIcon /> });
      list.push({ label: "Favoritos", href: "/assets/favoritos", icon: <SmFavoriteLineIcon /> });
    }
    if (canMycelium) {
      list.push({ label: "Mycelium", href: "/mycelium", icon: <SmGitForkLineIcon /> });
      list.push({ label: "Nova referência", href: "/mycelium/feed?novo=1", icon: <SmAdd2LineIcon /> });
    }
    if (isOverlens) {
      list.push({ label: "Registros", href: "/registros", icon: <SmRegisteredLineIcon /> });
      list.push({ label: "Buscar no INPI", href: "/registros/busca", icon: <SmSearchLineIcon /> });
      list.push({ label: "Nova marca", href: "/registros/marcas?novo=1", icon: <SmRegisteredLineIcon /> });
    }
    return list;
  }, [canAssets, canMycelium, isOverlens]);

  const systems = React.useMemo(
    () =>
      [...SYSTEMS].sort(
        (a, b) =>
          Number(canAccessSystem(role, b.href)) - Number(canAccessSystem(role, a.href)),
      ),
    [role],
  );

  // Outros systems acessíveis (o atual já está em `pages`).
  const otherSystems = React.useMemo(
    () =>
      (allSections ?? []).filter(
        (s) => s.basePath !== basePath && canAccessSystem(role, s.basePath),
      ),
    [allSections, basePath, role],
  );

  const renderGroups = (mode: "suggestions" | "search") => (
    <>
      <CommandGroup heading="Ações">
        {actions.map((a) => (
          <CommandItem
            key={a.href}
            value={`acao ${a.label}`}
            onSelect={() => go(a.href)}
          >
            {a.icon}
            {a.label}
            {a.shortcut && (
              <CommandShortcut aria-hidden="true">{a.shortcut}</CommandShortcut>
            )}
          </CommandItem>
        ))}
      </CommandGroup>

      {mode === "search" && pages.length > 0 && (
        <CommandGroup heading={`Páginas · ${title}`}>
          {pages.map((p) => {
            const path = p.segments.join("/");
            return (
              <CommandItem
                key={path}
                value={`pagina ${p.groupTitle} ${p.title}`}
                onSelect={() => go(`${basePath}/${path}`)}
              >
                <SmDocLineIcon />
                <span className="min-w-0 flex-1 truncate">{p.title}</span>
                <span className="hidden max-w-[40%] truncate text-xs text-muted-foreground sm:inline">
                  {p.groupTitle}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}

      {mode === "search" &&
        otherSystems.map((s) =>
          s.sections.length > 0 ? (
            <CommandGroup key={s.system} heading={`Páginas · ${s.title}`}>
              {s.sections.map((p) => {
                const path = p.segments.join("/");
                return (
                  <CommandItem
                    key={`${s.system}/${path}`}
                    value={`pagina ${s.title} ${p.groupTitle} ${p.title}`}
                    onSelect={() => go(`${s.basePath}/${path}`)}
                  >
                    <SmDocLineIcon />
                    <span className="min-w-0 flex-1 truncate">{p.title}</span>
                    <span className="hidden max-w-[40%] truncate text-xs text-muted-foreground sm:inline">
                      {p.groupTitle}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null,
        )}

      <CommandGroup heading="Systems">
        {systems.map((s) => {
          const allowed = canAccessSystem(role, s.href);
          const Icon = s.icon;
          return (
            <CommandItem
              key={s.href}
              value={`system ${s.name}`}
              disabled={!allowed}
              onSelect={() => allowed && go(s.href)}
            >
              <Icon />
              {s.name}
              {s.href === basePath && (
                <CommandShortcut aria-hidden="true">Atual</CommandShortcut>
              )}
            </CommandItem>
          );
        })}
      </CommandGroup>

      <CommandGroup heading="Apps">
        {APPS.map((app) => {
          const allowed = canAccessApp(role, app);
          return (
            <CommandItem
              key={app.href}
              value={`app ${app.name}`}
              disabled={!allowed}
              onSelect={() => allowed && go(app.href, !!app.external)}
            >
              {app.icon}
              {app.name}
              {app.external && (
                <SmArrowOutwardLineIcon
                  className="ml-auto size-4! text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </CommandItem>
          );
        })}
      </CommandGroup>

      {mode === "search" && canFerramentas && (
        <CommandGroup heading="Botões Mágicos">
          {FERRAMENTAS.map((f) => (
            <CommandItem
              key={f.href}
              value={`ferramenta ${f.title}`}
              onSelect={() => go(f.href)}
            >
              <SmToolSolidIcon />
              {f.title}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {mode === "search" && canAssets && (
        <CommandGroup heading="Assets">
          {assetCategories.map((c) => (
            <CommandItem
              key={c.slug}
              value={`asset ${c.title}`}
              onSelect={() => go(`/assets/${c.slug}`)}
            >
              <SmFolderLineIcon />
              {c.title}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {mode === "search" && isOverlens && (
        <CommandGroup heading="Registros">
          {REGISTROS_NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              value={`registros ${item.title}`}
              onSelect={() => go(item.href)}
            >
              <SmRegisteredLineIcon />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      <React.Suspense fallback={null}>
        <ConversationsGroup
          conversations={conversations}
          limit={mode === "suggestions" ? RECENT_CONVERSATIONS : undefined}
          go={go}
        />
      </React.Suspense>

      {mode === "search" &&
        ((footerLinks?.length ?? 0) > 0 || (isAdmin && (adminLinks?.length ?? 0) > 0)) && (
          <CommandGroup heading="Links">
            {isAdmin &&
              adminLinks?.map((l) => (
                <CommandItem
                  key={l.href}
                  value={`link ${l.title}`}
                  onSelect={() => go(l.href)}
                >
                  <SmDocLineIcon />
                  {l.title}
                </CommandItem>
              ))}
            {footerLinks?.map((l) => (
              <CommandItem
                key={l.href}
                value={`link ${l.title}`}
                onSelect={() => go(l.href)}
              >
                <SmArrowOutwardLineIcon />
                {l.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

      {mode === "search" && (
        <CommandGroup heading="Ajuda">
          <CommandItem
            value="atalhos de teclado teclas shortcuts"
            onSelect={() => setShowShortcuts(true)}
          >
            <SmHelpLineIcon />
            Atalhos de teclado
          </CommandItem>
        </CommandGroup>
      )}

      {(mode === "suggestions" || showShortcuts) && (
        <ShortcutsHint shortcuts={shortcuts} />
      )}

      {mode === "search" && <AskAssistantItem go={go} />}
    </>
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar"
      description="Busque páginas, systems, apps, ferramentas e conversas."
      placeholder="Buscar páginas, systems, conversas…"
      showCloseButton={false}
      className="rounded-prompt"
      suggestions={renderGroups("suggestions")}
    >
      {renderGroups("search")}
    </CommandDialog>
  );
}
