"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PromptArea, type PromptSubmitPayload } from "@/components/prompt-area";
import { MessageList } from "@/components/chat/message-list";
import { EmptyState } from "@/components/chat/empty-state";
import type { UIMessage } from "@/lib/ai/types";

export function NewChatPrompt() {
  const router = useRouter();
  const [optimisticMessage, setOptimisticMessage] =
    React.useState<UIMessage | null>(null);

  async function handleSubmit(payload: PromptSubmitPayload) {
    setOptimisticMessage({
      id: "optimistic-user",
      role: "user",
      content: payload.text,
    });

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstMessage: payload.text,
          planMode: payload.planMode,
          citedSection: payload.selectedSection,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Falha ao criar conversa");
      }

      const data = (await res.json()) as { id: string };
      router.push(`/chat/${data.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar conversa";
      toast.error(message);
      setOptimisticMessage(null);
    }
  }

  if (optimisticMessage) {
    return (
      <div
        data-slot="new-chat-optimistic"
        className="flex h-full min-h-0 w-full flex-col"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <MessageList messages={[optimisticMessage]} isLoading />
        </div>
        <div className="w-full shrink-0 bg-gradient-to-t from-background via-background to-background/0 pb-6 pt-2">
          <div className="mx-auto w-full max-w-3xl px-4">
            <PromptArea loading disabled />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center px-4 pb-40">
        <div className="w-full max-w-3xl">
          <EmptyState />
          <div className="mt-9">
            <PromptArea onSubmit={handleSubmit} autoFocus />
          </div>
        </div>
      </div>
    </div>
  );
}
