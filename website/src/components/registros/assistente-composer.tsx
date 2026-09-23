"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DOCUMENTO_TIPO_LABEL } from "@/lib/registros/types";
import { useSlashFocus } from "@/lib/use-slash-focus";
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

  // Atalho "/" foca o composer (ignorado enquanto se digita em outro campo).
  useSlashFocus(textareaRef);

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
        "group/prompt relative -mx-0.5 flex w-[calc(100%+4px)] flex-col gap-7 overflow-hidden rounded-prompt px-2 pt-4 pb-2",
        "bg-input/30",
        "border-2 border-transparent",
        "transition-[background-color,border-color]",
        "hover:bg-input/50",
        "focus-within:border-foreground/70 focus-within:bg-transparent",
      )}
    >
      <div className="flex items-start gap-2 pl-3 pr-2">
        <textarea
          ref={textareaRef}
          data-slot="prompt-area-input"
          placeholder={placeholder}
          aria-label={placeholder}
          aria-keyshortcuts="/"
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
            "min-h-[24px] max-h-[160px] w-full resize-none overflow-y-auto bg-transparent font-body text-base leading-relaxed tracking-normal outline-none focus-visible:ring-transparent",
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
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    data-slot="prompt-area-add"
                    aria-label="Anexar documentos"
                    className="text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
                  >
                    <SmAdd2LineIcon />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Anexar documentos</TooltipContent>
            </Tooltip>
            <PopoverContent align="start" sideOffset={8} className="w-80">
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                {docsDaMarca.length === 0 && (
                  <EmptyState
                    size="sm"
                    title="Nenhum documento disponível"
                    description="Não há documentos para esta seleção de marca."
                    action={
                      <Button asChild variant="outline" size="sm">
                        <Link href="/registros/documentos">Enviar documento</Link>
                      </Button>
                    }
                  />
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Marca em foco"
                className="text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
              >
                <span>
                  {marcas.find((m) => m.id === marcaId)?.nome ?? "Portfólio inteiro"}
                </span>
                <SmArrowDownIosLineIcon className="size-4" aria-hidden="true" />
              </Button>
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
              Sensível: modelo pago
            </Badge>
          )}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              data-slot="prompt-area-submit"
              disabled={!canSubmit}
              loading={loading}
              onClick={() => void handleSubmit()}
              aria-label={loading ? "Enviando" : "Enviar"}
            >
              <SmArrowUpwardLineIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Enviar (Enter)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
