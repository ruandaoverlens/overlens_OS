"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type ChatBreadcrumbProps = {
  conversations: { id: string; title: string }[];
};

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);
}

/** Topbar do chat: Conversas › título da conversa atual. */
export function ChatBreadcrumb({ conversations }: ChatBreadcrumbProps) {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  let label = "Nova conversa";
  if (id) {
    const found = conversations.find((c) => c.id === id);
    label = found?.title ? capitalizeFirst(found.title) : "Conversa";
  }

  return (
    <Breadcrumb aria-label="Navegação estrutural">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/chat"
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              Conversas
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="max-w-[40vw] truncate" title={label}>
            {label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
