"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import { useParams, usePathname } from "next/navigation";
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
  SidebarSeparator,
  SidebarSearch,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import {
  SmArrowForwardIosLineIcon,
  SmArrowOutwardLineIcon,
  SmArrowBackLineIcon,
  SmFolderLineIcon,
  SmFolderSolidIcon,
  SmDocLineIcon,
  SmDocSolidIcon,
  SmMessageCircleLineIcon,
  SmMessageCircleSolidIcon,
  SmGitForkLineIcon,
  SmChartLineIcon,
} from "@/components/icons";
import { useAuth, canAccessRoute } from "@/lib/auth";
import { SidebarProfile } from "@/components/sidebar-profile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConversationItem } from "@/components/chat/conversation-item";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
          <SidebarMenuSubButton asChild={false} className="cursor-pointer">
            <span>{section.title}</span>
            <SmArrowForwardIosLineIcon className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
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

// ─── Unified Sidebar ────────────────────────────────────

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
}: {
  sections: NavSection[];
  basePath: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  footerLinks?: SidebarLink[];
  separatorAfterIndex?: number;
  conversations?: ChatConversationLink[];
  defaultView?: "directives" | "conversations";
}) {
  const { user } = useAuth();
  const hasMounted = useMounted();
  const canAccessAssets = hasMounted && user ? canAccessRoute(user.role, "/assets") : false;
  const canAccessMycelium = hasMounted && user ? canAccessRoute(user.role, "/mycelium") : false;
  const isAdmin = hasMounted && user ? user.role === "admin" : false;

  const params = useParams();
  const pathname = usePathname();
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
  const [view, setView] = useState<"directives" | "conversations">(defaultView);
  const showTabs = Array.isArray(conversations);
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-between pb-[2px] pl-4 pr-0">
          <Link href={basePath}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-light.svg"
              alt={title}
              className="hidden h-5 w-auto dark:block"
            />
            <img
              src="/brand/logo-dark.svg"
              alt={title}
              className="h-5 w-auto dark:hidden"
            />
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <div className="h-2" />
      {backHref && backLabel && (
        <>
          <SidebarMenu className="p-2">
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarSearch>
                  {sections.map((section) => (
                    <CommandGroup key={section.slug} heading={section.title}>
                      {section.files.map((file) => (
                        <CommandItem key={file.slug} asChild>
                          <Link href={basePath + "/" + file.segments.join("/")}>
                            {file.title}
                          </Link>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </SidebarSearch>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-1.5">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {canAccessAssets ? (
                          <Link
                            href="/assets"
                            aria-label="Assets da Marca"
                            className="group/asset relative flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-white"
                          >
                            <SmFolderLineIcon className="size-6 transition-opacity group-hover/asset:opacity-0" />
                            <SmFolderSolidIcon className="absolute size-6 opacity-0 transition-opacity group-hover/asset:opacity-100" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            aria-label="Assets da Marca (bloqueado)"
                            className="flex size-8 items-center justify-center text-muted-foreground opacity-50 cursor-not-allowed"
                          >
                            <SmFolderLineIcon className="size-6" />
                          </button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {canAccessAssets ? "Assets da Marca" : "Assets da Marca (bloqueado)"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {canAccessMycelium ? (
                          <Link
                            href="/mycelium"
                            aria-label="Mycelium"
                            className="group/mycelium relative flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-white"
                          >
                            <SmGitForkLineIcon className="size-7 [&_[data-slot=front]]:transition-colors group-hover/mycelium:[&_[data-slot=front]]:fill-current" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            aria-label="Mycelium (bloqueado)"
                            className="flex size-8 items-center justify-center text-muted-foreground opacity-50 cursor-not-allowed"
                          >
                            <SmGitForkLineIcon className="size-7" />
                          </button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {canAccessMycelium ? "Mycelium" : "Mycelium (bloqueado)"}
                      </TooltipContent>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href="/admin/insights"
                            aria-label="Painel Admin"
                            aria-current={isAdminRoute ? "page" : undefined}
                            className={cn(
                              "group/admin relative flex size-8 items-center justify-center transition-colors",
                              isAdminRoute
                                ? "text-white"
                                : "text-muted-foreground hover:text-white",
                            )}
                          >
                            <SmChartLineIcon className="size-6" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Painel Admin · Insights de IA</TooltipContent>
                      </Tooltip>
                    )}
                    {showTabs && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setView("directives")}
                            aria-label="Diretrizes"
                            aria-pressed={view === "directives"}
                            className={cn(
                              "group/dir relative flex size-8 items-center justify-center transition-colors outline-none",
                              "text-muted-foreground hover:text-foreground",
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
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Diretrizes</TooltipContent>
                      </Tooltip>
                    )}
                    {showTabs && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setView("conversations")}
                            aria-label="Conversas"
                            aria-pressed={view === "conversations"}
                            className={cn(
                              "group/conv relative flex size-8 items-center justify-center transition-colors outline-none",
                              "text-muted-foreground hover:text-foreground",
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
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Conversas</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {showTabs && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/chat/new"
                          aria-label="Nova conversa"
                          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Plus className="size-6" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Nova conversa</TooltipContent>
                    </Tooltip>
                  )}
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

              {view === "conversations" && conversations && (
                <>
                  <li className="h-2" aria-hidden="true" />
                  {conversations.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                      Nenhuma conversa ainda.
                      <br />
                      Comece pela home de qualquer sistema.
                    </div>
                  ) : (
                    conversations.map((c) => (
                      <ConversationItem
                        key={c.id}
                        id={c.id}
                        title={c.title}
                        isActive={activeConversationId === c.id}
                      />
                    ))
                  )}
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
  );
}
