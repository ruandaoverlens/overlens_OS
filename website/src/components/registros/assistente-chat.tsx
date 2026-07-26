"use client";

import * as React from "react";
import { useChat } from "ai/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMessage } from "@/components/chat/user-message";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { AssistenteComposer } from "@/components/registros/assistente-composer";
import { classifyClientError, type ChatErrorInfo } from "@/lib/ai/chat-errors";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

export interface AssistenteMensagem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface AssistenteChatProps {
  marcas: Pick<MarcaRow, "id" | "nome">[];
  documentos: Pick<DocumentoRow, "id" | "marca_id" | "titulo" | "tipo" | "sensivel" | "mime_type">[];
  /** Conversa persistida (rota /registros/assistente/[id]). */
  conversaId?: string;
  initialMessages?: AssistenteMensagem[];
  initialMarcaId?: string | null;
  initialDocIds?: string[];
  className?: string;
}

export function AssistenteChat({
  marcas,
  documentos,
  conversaId,
  initialMessages,
  initialMarcaId,
  initialDocIds,
  className,
}: AssistenteChatProps) {
  const [marcaId, setMarcaId] = React.useState<string>(initialMarcaId ?? "");
  const [docIds, setDocIds] = React.useState<string[]>(initialDocIds ?? []);

  const docsDaMarca = React.useMemo(
    () => documentos.filter((d) => !marcaId || d.marca_id === marcaId),
    [documentos, marcaId],
  );

  // Ao trocar de marca, descarta anexos que não pertencem mais à seleção.
  React.useEffect(() => {
    setDocIds((prev) => prev.filter((id) => docsDaMarca.some((d) => d.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcaId]);

  const { messages, append, isLoading, error, reload } = useChat({
    api: "/api/registros/assistente",
    id: conversaId ?? "registros-assistente",
    initialMessages,
    body: {
      marcaId: marcaId || undefined,
      documentoIds: docIds,
      conversaId: conversaId ?? undefined,
    },
  });

  // Dispara a primeira resposta quando a conversa recém-criada chega com a
  // mensagem do usuário já persistida (mesmo padrão do ChatExperience).
  const autoTriggeredRef = React.useRef(false);
  React.useEffect(() => {
    if (autoTriggeredRef.current) return;
    if (!conversaId || !initialMessages || initialMessages.length === 0) return;
    const last = initialMessages[initialMessages.length - 1];
    if (last.role !== "user") return;
    autoTriggeredRef.current = true;
    void reload({
      body: {
        marcaId: marcaId || undefined,
        documentoIds: docIds,
        conversaId,
        skipPersistFirstUser: true,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId, initialMessages, reload]);

  const errorInfo: ChatErrorInfo | null = React.useMemo(
    () => (error ? classifyClientError(error) : null),
    [error],
  );

  React.useEffect(() => {
    if (!errorInfo) return;
    toast.error(errorInfo.message);
  }, [errorInfo]);

  // Auto-scroll para o fim quando chegam mensagens novas.
  const bottomRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    await append(
      { role: "user", content: trimmed },
      {
        body: {
          marcaId: marcaId || undefined,
          documentoIds: docIds,
          conversaId: conversaId ?? undefined,
        },
      },
    );
  }

  function toggleDoc(id: string) {
    setDocIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  const hasMessages = messages.length > 0;

  const composer = (
    <AssistenteComposer
      marcas={marcas}
      documentos={documentos}
      marcaId={marcaId}
      onMarcaChange={setMarcaId}
      docIds={docIds}
      onToggleDoc={toggleDoc}
      onSubmit={sendMessage}
      loading={isLoading}
      autoFocus
    />
  );

  if (!hasMessages) {
    return (
      <div
        data-slot="assistente-chat"
        className={cn("flex h-full min-h-0 w-full flex-col", className)}
      >
        <div className="flex flex-1 items-center justify-center px-4 pb-40">
          <div className="w-full max-w-2xl">
            <div className="mb-9 text-center">
              <h2 className="text-lg font-medium text-foreground">
                Pergunte sobre o portfólio de marcas
              </h2>
              <p className="mx-auto mt-1 max-w-md text-balance text-sm text-muted-foreground">
                As respostas se apoiam nos dados cadastrados no módulo, nunca de memória.
                A decisão jurídica final é sempre do time com o escritório.
              </p>
            </div>
            {composer}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="assistente-chat"
      className={cn("flex h-full min-h-0 w-full flex-col", className)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-6">
          {messages.map((m) =>
            m.role === "user" ? (
              <UserMessage key={m.id} content={m.content} />
            ) : m.role === "assistant" ? (
              <AssistantMessage key={m.id} messageId={m.id} content={m.content} readOnly />
            ) : null,
          )}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="mb-6 text-sm text-muted-foreground animate-pulse">Pensando…</div>
          )}
          {errorInfo && !isLoading && (
            <div className="mb-6 flex flex-col items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              <span>{errorInfo.message}</span>
              <Button variant="outline" size="sm" onClick={() => reload()}>
                Tentar novamente
              </Button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="w-full shrink-0 bg-gradient-to-t from-background via-background to-background/0 pb-6 pt-2">
        <div className="mx-auto w-full max-w-2xl px-4">{composer}</div>
      </div>
    </div>
  );
}
