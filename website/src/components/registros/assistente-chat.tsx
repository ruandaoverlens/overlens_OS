"use client";

import * as React from "react";
import { useChat } from "ai/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SmArrowUpwardLineIcon,
  SmClipsLineIcon,
  SmLockLineIcon,
} from "@/components/icons";
import { UserMessage } from "@/components/chat/user-message";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { classifyClientError, type ChatErrorInfo } from "@/lib/ai/chat-errors";
import { DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

const SUGESTOES = [
  "O que significa uma exigência?",
  "Qual a situação atual dos nossos processos?",
  "Há riscos nos candidatos do radar?",
  "O que precisamos para a renovação da OVERLENS?",
];

function isTextMime(mime: string | null): boolean {
  if (!mime) return false;
  const m = mime.toLowerCase();
  return m.startsWith("text/") || m.includes("json") || m.includes("xml");
}

type ModelAnnotation = {
  kind?: string;
  model?: string;
  contemSensivel?: boolean;
};

function isModelAnnotation(value: unknown): value is ModelAnnotation {
  return typeof value === "object" && value !== null;
}

interface AssistenteChatProps {
  marcas: Pick<MarcaRow, "id" | "nome">[];
  documentos: Pick<DocumentoRow, "id" | "marca_id" | "titulo" | "tipo" | "sensivel" | "mime_type">[];
  className?: string;
}

export function AssistenteChat({ marcas, documentos, className }: AssistenteChatProps) {
  const [marcaId, setMarcaId] = React.useState<string>("");
  const [docIds, setDocIds] = React.useState<string[]>([]);

  const docsDaMarca = React.useMemo(
    () => documentos.filter((d) => !marcaId || d.marca_id === marcaId),
    [documentos, marcaId],
  );

  // Ao trocar de marca, descarta anexos que não pertencem mais à seleção.
  React.useEffect(() => {
    setDocIds((prev) => prev.filter((id) => docsDaMarca.some((d) => d.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcaId]);

  const selectedDocs = React.useMemo(
    () => documentos.filter((d) => docIds.includes(d.id)),
    [documentos, docIds],
  );
  const willUsePaidModel = selectedDocs.some((d) => d.sensivel && isTextMime(d.mime_type));

  const { messages, append, isLoading, error, reload } = useChat({
    api: "/api/registros/assistente",
    id: "registros-assistente",
    body: { marcaId: marcaId || undefined, documentoIds: docIds },
  });

  const errorInfo: ChatErrorInfo | null = React.useMemo(
    () => (error ? classifyClientError(error) : null),
    [error],
  );

  React.useEffect(() => {
    if (!errorInfo) return;
    toast.error(errorInfo.message);
  }, [errorInfo]);

  // Extrai a anotação de modelo da última mensagem do assistente em stream.
  const lastModelInfo = React.useMemo<ModelAnnotation | null>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role !== "assistant") continue;
      const annotations = (m as { annotations?: unknown[] }).annotations;
      if (!Array.isArray(annotations)) continue;
      for (const a of annotations) {
        if (isModelAnnotation(a) && a.kind === "model") return a;
      }
    }
    return null;
  }, [messages]);

  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await append(
      { role: "user", content: trimmed },
      { body: { marcaId: marcaId || undefined, documentoIds: docIds } },
    );
  }

  function toggleDoc(id: string) {
    setDocIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  const hasMessages = messages.length > 0;

  return (
    <div data-slot="assistente-chat" className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      {/* Seletores: marca + documentos anexados */}
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          size="sm"
          className="w-auto min-w-[220px]"
          value={marcaId}
          onChange={(e) => setMarcaId(e.target.value)}
          aria-label="Marca"
        >
          <NativeSelectOption value="">Portfólio inteiro</NativeSelectOption>
          {marcas.map((m) => (
            <NativeSelectOption key={m.id} value={m.id}>
              {m.nome}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <SmClipsLineIcon />
              Anexar documentos
              {docIds.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {docIds.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {docsDaMarca.length === 0 && (
                <p className="p-2 text-sm text-muted-foreground">
                  Nenhum documento disponível para esta seleção.
                </p>
              )}
              {docsDaMarca.map((doc) => (
                <label
                  key={doc.id}
                  className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50"
                >
                  <Checkbox
                    size="sm"
                    checked={docIds.includes(doc.id)}
                    onCheckedChange={() => toggleDoc(doc.id)}
                    className="mt-0.5"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate">{doc.titulo}</span>
                      {doc.sensivel && <SmLockLineIcon className="size-3.5 shrink-0 text-warning" />}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {DOCUMENTO_TIPO_LABEL[doc.tipo]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="ml-auto">
          {willUsePaidModel ? (
            <Badge variant="warning">
              <SmLockLineIcon />
              Documento sensível anexado — usando modelo pago
            </Badge>
          ) : lastModelInfo?.contemSensivel ? (
            <Badge variant="warning">
              <SmLockLineIcon />
              Modelo pago em uso (documento sensível)
            </Badge>
          ) : (
            <Badge variant="outline">Modelo: Gemma (gratuito)</Badge>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-[var(--surface-950)] p-4">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                Pergunte sobre o portfólio de marcas
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                As respostas se apoiam nos dados cadastrados no módulo — nunca de memória.
                A decisão jurídica final é sempre do time com o escritório.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-full bg-accent/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col">
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
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 rounded-2xl bg-accent/50 p-2 dark:bg-input/30">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey || e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            void sendMessage(input);
          }}
          placeholder="Pergunte sobre processos, exigências, prazos ou documentos anexados…"
          rows={1}
          className="min-h-[24px] max-h-40 w-full resize-none overflow-y-auto bg-transparent px-3 py-2 text-sm leading-[1.6] outline-none placeholder:text-muted-foreground field-sizing-content"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          aria-label={isLoading ? "Enviando" : "Enviar"}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
            "bg-white text-black hover:bg-white/90",
            "disabled:opacity-30 disabled:pointer-events-none",
          )}
        >
          {isLoading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          ) : (
            <SmArrowUpwardLineIcon className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
