"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  SmLockSolidIcon,
} from "@/components/icons";
import { useAuth, canAccessRoute } from "@/lib/auth";

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

  useEffect(() => {
    const ancestor = findAncestorSlug(section.children, basePath, currentPath);
    if (ancestor) setOpenChildSlug(ancestor);
  }, [section.children, basePath, currentPath]);

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
          <Link href={href}>
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
                    <Link href={href}>
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

  useEffect(() => {
    const ancestor = findAncestorSlug(section.children, basePath, currentPath);
    if (ancestor) setOpenChildSlug(ancestor);
  }, [section.children, basePath, currentPath]);

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
          <Link href={href}>
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
                    <Link href={href}>
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
  subtitle,
  backHref,
  backLabel,
  footerLinks,
  separatorAfterIndex,
}: {
  sections: NavSection[];
  basePath: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  footerLinks?: SidebarLink[];
  separatorAfterIndex?: number;
}) {
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const canAccessAssets = hasMounted && user ? canAccessRoute(user.role, "/assets") : false;

  const params = useParams();
  const rawSlug = params?.slug;
  const currentSegments: string[] = Array.isArray(rawSlug)
    ? rawSlug
    : rawSlug
      ? [rawSlug]
      : [];

  const currentPath = "/" + currentSegments.join("/");

  const [openSlug, setOpenSlug] = useState<string | null>(
    findAncestorSlug(sections, basePath, currentPath)
  );

  useEffect(() => {
    const ancestor = findAncestorSlug(sections, basePath, currentPath);
    if (ancestor) setOpenSlug(ancestor);
  }, [sections, basePath, currentPath]);

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
                {canAccessAssets ? (
                  <SidebarMenuButton
                    size="sm"
                    className="h-12 rounded-[8px] bg-accent/50 text-[var(--surface-400)] hover:bg-accent hover:text-[var(--surface-300)] dark:bg-input/30 dark:hover:bg-input/50"
                    asChild
                  >
                    <Link href="/assets">
                      <SmFolderLineIcon />
                      <span>Assets da Marca</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    size="sm"
                    disabled
                    className="h-12 rounded-[8px] bg-accent/50 text-[var(--surface-400)] dark:bg-input/30 opacity-50 cursor-not-allowed"
                  >
                    <SmFolderLineIcon />
                    <span>Assets da Marca</span>
                    <SmLockSolidIcon className="ml-auto !size-[18px] text-[var(--surface-500)]" />
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-4">
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <p className="px-2 py-1 font-mono text-[10px] text-muted-foreground/50">
          Overlens {title} v1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
