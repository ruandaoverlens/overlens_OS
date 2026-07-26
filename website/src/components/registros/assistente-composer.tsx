"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SmAdd2LineIcon,
  SmArrowDownIosLineIcon,
  SmArrowUpwardLineIcon,
  SmLockLineIcon,
} from "@/components/icons";
import { DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import type { DocumentoRow, MarcaRow } from "@/lib/registros/types";

function isTextMime(mime: string | null): boolean {
  if (!mime) return false;
  const m = mime.toLowerCase();
  return m.startsWith("text/") || m.includes("json") || m.includes("xml");
}

export interface AssistenteComposerProps {
  marcas: Pick<MarcaRow, "id" | "nome">[];
  documentos: Pick<DocumentoRow, "id" | "marca_id" | "titulo" | "tipo" | "sensivel" | "mime_type">[];
  marcaId: string;
  onMarcaChange: (marcaId: string) => void;
  docIds: string[];
  onToggleDoc: (id: string) => void;
  onSubmit: (text: string) => void | Promise<void>;
  placeholder?: string;
  loading?: boolean;
  autoFocus?: boolean;
}

/**
 * Composer no estilo do PromptArea do Brand System, com as ações do módulo:
 * "+" abre o popover de documentos e a pill de marca troca o foco do contexto.
 */
export function AssistenteComposer({
  marcas,
  documentos,
  marcaId,
  onMarcaChange,
  docIds,
  onToggleDoc,
  onSubmit,
  placeholder = "Pergunte alguma coisa",
  loading = false,
  autoFocus = false,
}: AssistenteComposerProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const docsDaMarca = React.useMemo(
    () => documentos.filter((d) => !marcaId || d.marca_id === marcaId),
    [documentos, marcaId],
  );
  const willUsePaidModel = documentos.some(
    (d) => docIds.includes(d.id) && d.sensivel && isTextMime(d.mime_type),
  );

  const canSubmit = value.trim().length > 0 && !loading;

  async function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setValue("");
    await onSubmit(trimmed);
  }

  return (
    <div
      data-slot="assistente-prompt-area"
      className={cn(
        "group/prompt relative -mx-0.5 flex w-[calc(100%+4px)] flex-col gap-7 overflow-hidden rounded-3xl px-2 pt-4 pb-2",
        "bg-accent/50 dark:bg-input/30",
        "border-2 border-transparent",
        "transition-[background-color,border-color]",
        "hover:bg-accent dark:hover:bg-input/50",
        "focus-within:border-input focus-within:bg-transparent",
        "dark:focus-within:bg-transparent",
      )}
    >
      <div className="flex items-start gap-2 pl-3 pr-2">
        <textarea
          ref={textareaRef}
          data-slot="prompt-area-input"
          placeholder={placeholder}
          value={value}
          disabled={loading}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (e.shiftKey || e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            void handleSubmit();
          }}
          className={cn(
            "min-h-[24px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent font-body text-base leading-[1.6] tracking-[0.16px] outline-none",
            "placeholder:text-muted-foreground",
            "text-foreground",
            "field-sizing-content",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          rows={1}
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-slot="prompt-area-add"
                aria-label="Anexar documentos"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
                  "text-muted-foreground/60 hover:bg-accent hover:text-foreground",
                  "dark:hover:bg-input/50",
                  "data-[state=open]:bg-accent data-[state=open]:text-foreground",
                  "dark:data-[state=open]:bg-input/50",
                )}
              >
                <SmAdd2LineIcon className="size-6" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-80">
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
                      onCheckedChange={() => onToggleDoc(doc.id)}
                      className="mt-0.5"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate">{doc.titulo}</span>
                        {doc.sensivel && (
                          <SmLockLineIcon className="size-3.5 shrink-0 text-warning" />
                        )}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Marca"
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors outline-none",
                  "text-muted-foreground hover:bg-accent hover:text-foreground",
                  "dark:hover:bg-input/50",
                  "data-[state=open]:bg-accent data-[state=open]:text-foreground",
                  "dark:data-[state=open]:bg-input/50",
                )}
              >
                <span>
                  {marcas.find((m) => m.id === marcaId)?.nome ?? "Portfólio inteiro"}
                </span>
                <SmArrowDownIosLineIcon className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="min-w-[220px] pb-2">
              <DropdownMenuRadioGroup value={marcaId} onValueChange={onMarcaChange}>
                <DropdownMenuRadioItem value="">Portfólio inteiro</DropdownMenuRadioItem>
                {marcas.map((m) => (
                  <DropdownMenuRadioItem key={m.id} value={m.id}>
                    {m.nome}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {docIds.length > 0 && (
            <Badge variant="secondary">
              {docIds.length} {docIds.length === 1 ? "documento" : "documentos"}
            </Badge>
          )}
          {willUsePaidModel && (
            <Badge variant="warning">
              <SmLockLineIcon />
              Sensível — modelo pago
            </Badge>
          )}
        </div>

        <button
          type="button"
          data-slot="prompt-area-submit"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
          aria-label={loading ? "Enviando" : "Enviar"}
          aria-busy={loading || undefined}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors outline-none",
            "bg-white text-black",
            "hover:bg-white/90",
            "disabled:opacity-30 disabled:pointer-events-none",
          )}
        >
          {loading ? (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
            />
          ) : (
            <SmArrowUpwardLineIcon className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
}
