"use client";

import React, { Suspense, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMounted } from "@/lib/use-mounted";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarMenuSkeleton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SmAdd2LineIcon,
  SmArrowForwardIosLineIcon,
  SmArrowOutwardLineIcon,
  SmArrowBackLineIcon,
  SmFolderLineIcon,
  SmFolderSolidIcon,
  SmDocLineIcon,
  SmDocSolidIcon,
  SmMessageCircleLineIcon,
  SmMessageCircleSolidIcon,
  SmRegisteredLineIcon,
} from "@/components/icons";
import { useAuth, canAccessRoute, isStaffOrAdmin } from "@/lib/auth";
import { isOverlensEmail } from "@/lib/route-access";
import { SidebarProfile } from "@/components/sidebar-profile";
import { SystemSwitcher } from "@/components/system-switcher";
import {
  CommandPalette,
  CommandPaletteButton,
  CommandPaletteProvider,
  useResolvedConversations,
  type ConversationsInput,
  type SystemPagesIndex,
} from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConversationItem } from "@/components/chat/conversation-item";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { useUrlState } from "@/lib/use-url-state";

export type ChatConversationLink = {
  id: string;
  title: string;
};

// ─── Types (serializable, no content) ────────────────────

export interface NavFile {
  slug: string;
  title: string;
  segments: string[];
}

export interface NavSection {
  slug: string;
  title: string;
  files: NavFile[];
  children: NavSection[];
  segments: string[];
}

export interface SidebarLink {
  title: string;
  href: string;
}

// ─── Helpers ─────────────────────────────────────────────

function isAncestor(section: NavSection, basePath: string, currentPath: string): boolean {
  if (
    section.files.some(
      (f) => basePath + "/" + f.segments.join("/") === basePath + currentPath
    )
  )
    return true;
  return section.children.some((c) => isAncestor(c, basePath, currentPath));
}

function findAncestorSlug(sections: NavSection[], basePath: string, currentPath: string): string | null {
  for (const section of sections) {
    if (isAncestor(section, basePath, currentPath)) return section.slug;
  }
  return null;
}

function findFirstAccordionSlug(sections: NavSection[]): string | null {
  for (const section of sections) {
    const isLeaf = section.files.length === 1 && section.children.length === 0;
    if (!isLeaf) return section.slug;
  }
  return null;
}

function makeSectionDragHandler(title: string, segments: string[]) {
  return (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/x-overlens-section",
      JSON.stringify({ title, segments })
    );
    e.dataTransfer.effectAllowed = "copy";

    // Suppress the browser's "not-allowed" cursor by accepting drops globally
    // for the duration of this drag. Listeners self-cleanup on dragend/drop.
    const allowDrop = (ev: DragEvent) => {
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "copy";
    };
    const cleanup = () => {
      window.removeEventListener("dragover", allowDrop);
      window.removeEventListener("drop", onGlobalDrop);
      window.removeEventListener("dragend", cleanup);
    };
    const onGlobalDrop = (ev: DragEvent) => {
      ev.preventDefault();
      cleanup();
    };
    window.addEventListener("dragover", allowDrop);
    window.addEventListener("drop", onGlobalDrop);
    window.addEventListener("dragend", cleanup);
  };
}

// ─── Top-level section item ─────────────────────────────

function SectionItem({
  section,
  currentSegments,
  basePath,
  open,
  onToggle,
}: {
  section: NavSection;
  currentSegments: string[];
  basePath: string;
  open: boolean;
  onToggle: (slug: string, open: boolean) => void;
}) {
  const currentPath = "/" + currentSegments.join("/");

  const [openChildSlug, setOpenChildSlug] = useState<string | null>(
    findAncestorSlug(section.children, basePath, currentPath)
  );

  // Auto-open the ancestor accordion when navigation changes the path.
  // Adjust state during render (React-recommended) rather than in an effect.
  const [prevPath, setPrevPath] = useState(currentPath);
  if (prevPath !== currentPath) {
    setPrevPath(currentPath);
    const ancestor = findAncestorSlug(section.children, basePath, currentPath);
    if (ancestor) setOpenChildSlug(ancestor);
  }

  const handleChildToggle = (slug: string, isOpen: boolean) => {
    setOpenChildSlug(isOpen ? slug : null);
  };

  if (section.files.length === 1 && section.children.length === 0) {
    const file = section.files[0];
    const href = basePath + "/" + file.segments.join("/");
    const isActive = basePath + currentPath === href;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive} size="sm" asChild>
          <Link
            href={href}
            draggable
            onDragStart={makeSectionDragHandler(section.title, file.segments)}
          >
            <span>{section.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(v) => onToggle(section.slug, v)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton size="sm">
            <span>{section.title}</span>
            <SmArrowForwardIosLineIcon className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {section.files.map((file) => {
              const href = basePath + "/" + file.segments.join("/");
              const isActive = basePath + currentPath === href;
              return (
                <SidebarMenuSubItem key={file.slug}>
                  <SidebarMenuSubButton isActive={isActive} asChild>
                    <Link
                      href={href}
                      draggable
                      onDragStart={makeSectionDragHandler(file.title, file.segments)}
                    >
                      <span>{file.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
            {section.children.map((child) => (
              <NestedSectionItem
                key={child.slug}
                section={child}
                currentSegments={currentSegments}
                basePath={basePath}
                open={openChildSlug === child.slug}
                onToggle={handleChildToggle}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// ─── Nested section item (inside SidebarMenuSub) ────────

function NestedSectionItem({
  section,
  currentSegments,
  basePath,
  open,
  onToggle,
}: {
  section: NavSection;
  currentSegments: string[];
  basePath: string;
  open: boolean;
  onToggle: (slug: string, open: boolean) => void;
}) {
  const currentPath = "/" + currentSegments.join("/");

  const [openChildSlug, setOpenChildSlug] = useState<string | null>(
    findAncestorSlug(section.children, basePath, currentPath)
  );

  // Auto-open the ancestor accordion when navigation changes the path.
  // Adjust state during render (React-recommended) rather than in an effect.
  const [prevPath, setPrevPath] = useState(currentPath);
  if (prevPath !== currentPath) {
    setPrevPath(currentPath);
    const ancestor = findAncestorSlug(section.children, basePath, currentPath);
    if (ancestor) setOpenChildSlug(ancestor);
  }

  const handleChildToggle = (slug: string, isOpen: boolean) => {
    setOpenChildSlug(isOpen ? slug : null);
  };

  if (section.files.length === 1 && section.children.length === 0) {
    const file = section.files[0];
    const href = basePath + "/" + file.segments.join("/");
    const isActive = basePath + currentPath === href;
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton isActive={isActive} asChild>
          <Link
            href={href}
            draggable
            onDragStart={makeSectionDragHandler(section.title, file.segments)}
          >
            <span>{section.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(v) => onToggle(section.slug, v)}
      className="group/nested"
    >
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton asChild className="cursor-pointer">
            <button type="button" aria-expanded={open}>
              <span>{section.title}</span>
              <SmArrowForwardIosLineIcon className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {section.files.map((file) => {
              const href = basePath + "/" + file.segments.join("/");
              const isActive = basePath + currentPath === href;
              return (
                <SidebarMenuSubItem key={file.slug}>
                  <SidebarMenuSubButton isActive={isActive} asChild>
                    <Link
                      href={href}
                      draggable
                      onDragStart={makeSectionDragHandler(file.title, file.segments)}
                    >
                      <span>{file.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
            {section.children.map((child) => (
              <NestedSectionItem
                key={child.slug}
                section={child}
                currentSegments={currentSegments}
                basePath={basePath}
                open={openChildSlug === child.slug}
                onToggle={handleChildToggle}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}

// ─── Conversas (resolve a Promise dentro do Suspense) ───

function SidebarConversations({
  conversations,
  activeConversationId,
}: {
  conversations: ConversationsInput;
  activeConversationId?: string;
}) {
  const list = useResolvedConversations(conversations);
  if (list.length === 0) {
    return (
      <li>
        <EmptyState
          size="sm"
          className="border-none"
          icon={<SmMessageCircleLineIcon />}
          title="Nenhuma conversa ainda"
          description="Comece uma conversa com o assistente a partir de qualquer sistema."
          action={
            <Button size="sm" asChild>
              <Link href="/chat/new">Nova conversa</Link>
            </Button>
          }
        />
      </li>
    );
  }
  return (
    <>
      {list.map((c) => (
        <ConversationItem
          key={c.id}
          id={c.id}
          title={c.title}
          isActive={activeConversationId === c.id}
        />
      ))}
    </>
  );
}

function SidebarConversationsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} aria-hidden="true">
          <SidebarMenuSkeleton showIcon />
        </li>
      ))}
    </>
  );
}

// ─── Unified Sidebar ────────────────────────────────────

type SidebarView = "directives" | "conversations";

const VIEW_STORAGE_KEY = "overlens:sidebar-view";

function isSidebarView(value: string | null): value is SidebarView {
  return value === "directives" || value === "conversations";
}

/** localStorage pode lançar (modo privativo, cookies bloqueados) — nunca quebra a sidebar. */
function readStoredView(): SidebarView | null {
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return isSidebarView(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStoredView(view: SidebarView): void {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // sem persistência — a escolha vale só para esta sessão
  }
}

export function SystemSidebar({
  sections,
  basePath,
  title,
  backHref,
  backLabel,
  footerLinks,
  separatorAfterIndex,
  conversations,
  defaultView = "directives",
  adminLinks,
  allSections,
  collapsible,
}: {
  sections: NavSection[];
  basePath: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  footerLinks?: SidebarLink[];
  separatorAfterIndex?: number;
  /** Array ou Promise (não awaitada no layout — o shell não espera o banco). */
  conversations?: ConversationsInput;
  defaultView?: "directives" | "conversations";
  adminLinks?: SidebarLink[];
  /** Índice de páginas dos demais systems para a command palette. */
  allSections?: SystemPagesIndex[];
  /** Modo de colapso da Sidebar — `icon` mantém busca e "+" visíveis. */
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { user } = useAuth();
  const hasMounted = useMounted();
  const canAccessAssets = hasMounted && user ? canAccessRoute(user.role, "/assets") : false;
  const isAdmin = hasMounted && user ? isStaffOrAdmin(user.role) : false;
  // Atalho de Registros: exclusivo da equipe interna (@overlens.com.br)
  const isOverlens = hasMounted && user ? isOverlensEmail(user.email) : false;

  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const rawSlug = params?.slug;
  const currentSegments: string[] = Array.isArray(rawSlug)
    ? rawSlug
    : rawSlug
      ? [rawSlug]
      : [];

  const currentPath = "/" + currentSegments.join("/");

  const [openSlug, setOpenSlug] = useState<string | null>(
    findAncestorSlug(sections, basePath, currentPath) ?? findFirstAccordionSlug(sections)
  );
  const showTabs = conversations !== undefined;

  // A aba (Diretrizes/Conversas) vive na URL (`?view=`): o link fica
  // compartilhável e o Back do navegador desfaz a troca. O localStorage segue
  // como memória entre visitas — é o fallback quando a URL não diz nada.
  const [urlView, setUrlView] = useUrlState<string>("view", "");
  // Lido uma única vez, na montagem: se o fallback acompanhasse a escolha
  // corrente, o Back (que só remove `?view=`) leria o valor novo e consumiria
  // uma entrada do histórico sem mudar nada na tela.
  const [storedView, setStoredView] = useState<SidebarView | null>(null);
  const readStorageOnce = useRef(false);

  // Só depois de montar: localStorage não existe no SSR e ler durante o
  // render causaria divergência de hidratação.
  React.useEffect(() => {
    if (!showTabs || readStorageOnce.current) return;
    readStorageOnce.current = true;
    setStoredView(readStoredView());
  }, [showTabs]);

  const view: SidebarView = isSidebarView(urlView)
    ? urlView
    : (storedView ?? defaultView);

  // Persistir a aba corrente é seguro: `storedView` (o fallback desta
  // montagem) não muda junto, então o histórico continua reversível.
  React.useEffect(() => {
    if (!showTabs) return;
    writeStoredView(view);
  }, [showTabs, view]);

  const changeView = React.useCallback(
    (next: SidebarView) => {
      // `push`: o Back volta para a aba anterior em vez de sair da página.
      setUrlView(next, { history: "push" });
    },
    [setUrlView],
  );

  const activeConversationId =
    typeof params?.id === "string" ? params.id : undefined;

  // Auto-open the ancestor accordion when navigation changes the path.
  // Adjust state during render (React-recommended) rather than in an effect.
  const [prevPath, setPrevPath] = useState(currentPath);
  if (prevPath !== currentPath) {
    setPrevPath(currentPath);
    const ancestor = findAncestorSlug(sections, basePath, currentPath);
    if (ancestor) setOpenSlug(ancestor);
  }

  const handleToggle = (slug: string, isOpen: boolean) => {
    setOpenSlug(isOpen ? slug : null);
  };

  const { isMobile, setOpenMobile } = useSidebar();
  // No mobile a Sidebar é um drawer: fecha ao concluir uma navegação, para que
  // clicar num link não custe um toque extra. Só o pathname dispara — abrir
  // acordeões e trocar de aba (`?view=`) mantêm o drawer aberto.
  React.useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <CommandPaletteProvider>
      {/* Irmã de <Sidebar>: no mobile a Sidebar vira drawer e some junto com o
          seu conteúdo — a palette vive fora dela para continuar montada. */}
      <CommandPalette
        sections={sections}
        basePath={basePath}
        title={title}
        conversations={conversations}
        footerLinks={footerLinks}
        adminLinks={adminLinks}
        allSections={allSections}
      />
    <Sidebar collapsible={collapsible}>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between pb-0.5 pl-4 pr-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <Link
            href={basePath}
            aria-label={`${title} — início`}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground group-data-[collapsible=icon]:hidden"
          >
            {/* O logo é um SVG de cor chapada: `logo-light` é branco (fundo
                escuro) e `logo-dark` é preto (fundo claro). A troca é por CSS
                — com `useTheme()` o logo apareceria na cor errada até hidratar.
                O `display:none` também tira da árvore de acessibilidade, então
                o leitor de tela anuncia o `alt` uma única vez. */}
            <Image
              src="/brand/logo-dark.svg"
              alt={title}
              width={264}
              height={34}
              priority
              className="h-5 w-auto dark:hidden"
            />
            <Image
              src="/brand/logo-light.svg"
              alt={title}
              width={264}
              height={34}
              priority
              className="hidden h-5 w-auto dark:block"
            />
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* "Voltar ao system" abre o bloco de navegação do drawer no mobile
            e da sidebar no desktop. */}
        {backHref && backLabel && (
          <>
            <SidebarMenu className="p-2 pt-4">
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <Link href={backHref}>
                    <SmArrowBackLineIcon />
                    <span>{backLabel}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
          </>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SystemSwitcher basePath={basePath} />
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-1.5">
                {/* Barra de ícones: o realce do hover é só a troca de linha
                    para sólido e a cor — cada botão zera o fundo do ghost. */}
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {/* Assets some por completo para quem não tem acesso —
                        um ícone bloqueado só ocupa espaço na barra. */}
                    {canAccessAssets && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className="group/asset cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
                          >
                            <Link href="/assets" aria-label="Assets da Marca">
                              <SmFolderLineIcon className="size-6 transition-opacity group-hover/asset:opacity-0" />
                              <SmFolderSolidIcon className="absolute size-6 opacity-0 transition-opacity group-hover/asset:opacity-100" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Assets da Marca</TooltipContent>
                      </Tooltip>
                    )}
                    {showTabs && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => changeView("directives")}
                            aria-label="Diretrizes"
                            aria-pressed={view === "directives"}
                            className={cn(
                              "group/dir cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground",
                              view === "directives" && "text-foreground",
                            )}
                          >
                            {view === "directives" ? (
                              <SmDocSolidIcon className="size-6" />
                            ) : (
                              <>
                                <SmDocLineIcon className="size-6 transition-opacity group-hover/dir:opacity-0" />
                                <SmDocSolidIcon className="absolute size-6 opacity-0 transition-opacity group-hover/dir:opacity-100" />
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Diretrizes</TooltipContent>
                      </Tooltip>
                    )}
                    {showTabs && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              // Abre a home do sistema (composer "Pergunte alguma coisa")
                              if (pathname !== basePath) {
                                router.push(`${basePath}?view=conversations`);
                              } else {
                                changeView("conversations");
                              }
                            }}
                            aria-label="Conversas"
                            aria-pressed={view === "conversations"}
                            className={cn(
                              "group/conv cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground",
                              view === "conversations" && "text-foreground",
                            )}
                          >
                            {view === "conversations" ? (
                              <SmMessageCircleSolidIcon className="size-6" />
                            ) : (
                              <>
                                <SmMessageCircleLineIcon className="size-6 transition-opacity group-hover/conv:opacity-0" />
                                <SmMessageCircleSolidIcon className="absolute size-6 opacity-0 transition-opacity group-hover/conv:opacity-100" />
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Conversas</TooltipContent>
                      </Tooltip>
                    )}
                    {isOverlens && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            asChild
                            className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
                          >
                            <Link href="/registros" aria-label="Registros">
                              <SmRegisteredLineIcon className="size-6" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Registros</TooltipContent>
                      </Tooltip>
                    )}
                    {/* A lupa fecha o grupo da esquerda; só o "+" fica à direita.
                        Ela vem um passo menor: o glifo da lupa tem mais massa
                        visual que os demais no mesmo tamanho nominal. */}
                    <CommandPaletteButton
                      iconOnly
                      className="hover:bg-transparent [&>svg]:size-5.5"
                    />
                  </div>
                  <div className="flex shrink-0 items-center">
                  {showTabs && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="shrink-0 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground"
                        >
                          <Link
                            href="/chat/new"
                            aria-label="Nova conversa"
                            aria-keyshortcuts="Control+Shift+O Meta+Shift+O"
                          >
                            <SmAdd2LineIcon className="size-6" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Nova conversa (Ctrl+Shift+O)</TooltipContent>
                    </Tooltip>
                  )}
                  </div>
                </div>
              </SidebarMenuItem>

              {view === "directives" && (
                <>
                  <SidebarMenuItem className="mt-2">
                    <SidebarMenuButton isActive={currentSegments.length === 0} size="sm" asChild>
                      <Link href={basePath}>
                        <span>Introdução</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isAdmin &&
                    adminLinks?.map((link) => (
                      <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton isActive={isAdminRoute} size="sm" asChild>
                          <Link href={link.href}>
                            <span>{link.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  {sections.map((section, i) => (
                    <React.Fragment key={section.slug}>
                      <SectionItem
                        section={section}
                        currentSegments={currentSegments}
                        basePath={basePath}
                        open={openSlug === section.slug}
                        onToggle={handleToggle}
                      />
                      {separatorAfterIndex === i && (
                        <SidebarSeparator className="my-2" />
                      )}
                    </React.Fragment>
                  ))}
                  {footerLinks && footerLinks.length > 0 && (
                    <>
                      <SidebarSeparator className="my-2" />
                      {footerLinks.map((link) => (
                        <SidebarMenuItem key={link.href}>
                          <SidebarMenuButton size="sm" asChild>
                            <Link href={link.href}>
                              <span>{link.title}</span>
                              <SmArrowOutwardLineIcon className="ml-auto" />
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}

              {view === "conversations" && conversations !== undefined && (
                <>
                  <li className="h-2" aria-hidden="true" />
                  <Suspense fallback={<SidebarConversationsSkeleton />}>
                    <SidebarConversations
                      conversations={conversations}
                      activeConversationId={activeConversationId}
                    />
                  </Suspense>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarProfile />
      </SidebarFooter>
    </Sidebar>
    </CommandPaletteProvider>
  );
}
