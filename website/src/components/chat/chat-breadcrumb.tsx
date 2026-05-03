"use client";

import { useParams } from "next/navigation";

type ChatBreadcrumbProps = {
  conversations: { id: string; title: string }[];
};

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("pt-BR") + s.slice(1);
}

export function ChatBreadcrumb({ conversations }: ChatBreadcrumbProps) {
  const params = useParams<{ id?: string }>();
  const id = params?.id;

  let label = "Nova conversa";
  if (id) {
    const found = conversations.find((c) => c.id === id);
    label = found?.title ? capitalizeFirst(found.title) : "Conversa";
  }

  return (
    <span className="truncate text-sm font-medium" title={label}>
      {label}
    </span>
  );
}
