"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/notifications/toast";
import { PromptArea, type PromptSubmitPayload } from "@/components/prompt-area";
import { MessageList } from "@/components/chat/message-list";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { useCitableSections } from "@/components/chat/citable-sections-provider";
import type { ChatAttachment, UIMessage } from "@/lib/ai/types";

async function fileToAttachment(file: File): Promise<ChatAttachment> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(reader.error ?? new Error("Falha ao ler arquivo"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Formato inesperado ao ler arquivo"));
    };
    reader.readAsDataURL(file);
  });
  return {
    name: file.name,
    contentType: file.type || "application/octet-stream",
    url,
  };
}

export function NewChatPrompt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const { citableSections, basePath } = useCitableSections();
  const [optimisticMessage, setOptimisticMessage] =
    React.useState<UIMessage | null>(null);
  /*
   * O composer original desmonta quando a mensagem otimista entra. Se o envio
   * falhar, ele volta a montar vazio — então guardamos o rascunho aqui e o
   * devolvemos como estado inicial.
   */
  const [draft, setDraft] = React.useState<{
    text: string;
    files: File[];
  } | null>(null);

  async function handleSubmit(payload: PromptSubmitPayload) {
    let attachments: ChatAttachment[] = [];
    if (payload.attachments.length > 0) {
      try {
        attachments = await Promise.all(
          payload.attachments.map(fileToAttachment),
        );
      } catch (err) {
        console.error("Falha ao processar anexos:", err);
        notify.error("Não foi possível processar os anexos.");
        return;
      }
    }

    setDraft({ text: payload.text, files: payload.attachments });
    setOptimisticMessage({
      id: "optimistic-user",
      role: "user",
      content: payload.text,
      experimental_attachments:
        attachments.length > 0 ? attachments : undefined,
    });

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstMessage: payload.text,
          planMode: payload.planMode,
          citedSection: payload.selectedSection,
          attachments,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Falha ao criar conversa");
      }

      const data = (await res.json()) as { id: string };
      setDraft(null);
      router.push(`/chat/${data.id}`);
    } catch (err) {
      notify.fromError(err, "Erro ao criar conversa");
      // Restaura o composer com o texto e os anexos do envio que falhou.
      setOptimisticMessage(null);
    }
  }

  if (optimisticMessage) {
    return (
      <div
        data-slot="new-chat-optimistic"
        className="flex h-full min-h-0 w-full flex-col"
      >
        <h1 className="sr-only">Nova conversa</h1>
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
          <ChatWelcome />
          <div className="mt-9">
            <PromptArea
              citableSections={citableSections}
              basePath={basePath}
              onSubmit={handleSubmit}
              autoFocus
              focusShortcut
              initialValue={draft?.text ?? initialQuery}
              initialAttachments={draft?.files}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
