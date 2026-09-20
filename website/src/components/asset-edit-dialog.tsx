"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAssetMetadata, type AssetMetadataInput } from "@/lib/asset-metadata";
import { notify } from "@/lib/notifications";

/** Per-bank configuration for which fields to show / what labels to use. */
export interface AssetEditConfig {
  assetType: "image" | "video" | "audio";
  /** Storage folder (Imagens/Footages/Musicas). Required if `allowRename` is true. */
  folder?: string;
  /** Show the filename field with rename action. Only meaningful for storage-listed banks (images). */
  allowRename?: boolean;
  /** Author label override (e.g. "Artista" for audio). */
  authorLabel?: string;
  /** Hide the caption field. */
  hideCaption?: boolean;
  /** Hide the year field. */
  hideYear?: boolean;
  /** Hide the source URL field. */
  hideSourceUrl?: boolean;
}

interface AssetEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AssetEditConfig;
  /** Stable asset key (filename for images, derived id for video/audio). */
  assetKey: string;
  /** Pre-fill values shown in the form. Pass merged-with-defaults values from the bank. */
  initial: {
    title: string;
    caption: string;
    author: string;
    year: string;
    sourceUrl: string;
    tags: string[];
    /** Current filename — required when allowRename. */
    filename?: string;
  };
  /** Optional callback fired after a successful save (and possible rename). */
  onSaved?: (result: { renamedTo?: string }) => void;
  /** Extra slot rendered before the form (e.g. a thumbnail). */
  preview?: ReactNode;
}

type FieldName = "filename" | "year" | "source";
type FieldErrors = Partial<Record<FieldName, string>>;

function extensionOf(name: string): string {
  const m = name.match(/\.[^.]+$/);
  return m ? m[0].toLowerCase() : "";
}

export function AssetEditDialog({
  open,
  onOpenChange,
  config,
  assetKey,
  initial,
  onSaved,
  preview,
}: AssetEditDialogProps) {
  const meta = useAssetMetadata(config.assetType);
  const confirm = useConfirm();
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const errorIdFor = (name: FieldName) => fieldId(`${name}-error`);
  const formErrorId = fieldId("error");

  const [title, setTitle] = useState(initial.title);
  const [caption, setCaption] = useState(initial.caption);
  const [author, setAuthor] = useState(initial.author);
  const [year, setYear] = useState(initial.year);
  const [sourceUrl, setSourceUrl] = useState(initial.sourceUrl);
  const [tagsRaw, setTagsRaw] = useState(initial.tags.join(", "));
  const [filename, setFilename] = useState(initial.filename ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /**
   * Os bancos montam `initial` como objeto literal a cada render: comparar por
   * referência resetaria o formulário no meio da digitação sempre que o pai
   * re-renderizasse. A assinatura abaixo compara por valor.
   */
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const initialSignature = JSON.stringify([
    assetKey,
    initial.title,
    initial.caption,
    initial.author,
    initial.year,
    initial.sourceUrl,
    initial.tags,
    initial.filename ?? "",
  ]);

  useEffect(() => {
    if (!open) return;
    const source = initialRef.current;
    setTitle(source.title);
    setCaption(source.caption);
    setAuthor(source.author);
    setYear(source.year);
    setSourceUrl(source.sourceUrl);
    setTagsRaw(source.tags.join(", "));
    setFilename(source.filename ?? "");
    setError(null);
    setFieldErrors({});
  }, [open, initialSignature]);

  const clearFieldError = (name: FieldName) =>
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));

  /** Validação por campo. Valores legados não alterados (ex.: ano "séc. XVII") passam. */
  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (config.allowRename && initial.filename) {
      const next = filename.trim();
      if (!next) {
        errors.filename = "Informe o nome do arquivo.";
      } else if (next.includes("/") || next.includes("\\")) {
        errors.filename = "O nome não pode conter barras.";
      } else if (extensionOf(next) !== extensionOf(initial.filename)) {
        errors.filename = `Mantenha a extensão original (${extensionOf(initial.filename) || "sem extensão"}).`;
      }
    }

    if (!config.hideYear) {
      const y = year.trim();
      if (y && y !== initial.year.trim() && !/^\d{4}$/.test(y)) {
        errors.year = "Use o ano com 4 dígitos (ex.: 1931).";
      }
    }

    if (!config.hideSourceUrl) {
      const u = sourceUrl.trim();
      if (u) {
        try {
          const parsed = new URL(u);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            errors.source = "O link precisa começar com http:// ou https://";
          }
        } catch {
          errors.source = "Link inválido. Use um endereço completo, com https://";
        }
      }
    }

    return errors;
  };

  const focusFirstInvalid = (errors: FieldErrors) => {
    const order: FieldName[] = ["filename", "year", "source"];
    const first = order.find((n) => errors[n]);
    if (first) document.getElementById(fieldId(first))?.focus();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setError(null);
      focusFirstInvalid(errors);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let currentKey = assetKey;
      let renamedTo: string | undefined;

      if (config.allowRename && config.folder && initial.filename && filename.trim() && filename.trim() !== initial.filename) {
        const renameResult = await meta.rename(config.folder, initial.filename, filename.trim());
        if (!renameResult.ok) {
          setFieldErrors({ filename: renameResult.error });
          notify.error("Não foi possível renomear", { description: renameResult.error });
          setSaving(false);
          document.getElementById(fieldId("filename"))?.focus();
          return;
        }
        currentKey = renameResult.newFilename;
        renamedTo = renameResult.newFilename;
        notify.success("Asset renomeado");
      }

      const input: AssetMetadataInput = {
        title: title.trim() || null,
        caption: config.hideCaption ? null : (caption.trim() || null),
        author: author.trim() || null,
        year: config.hideYear ? null : (year.trim() || null),
        sourceUrl: config.hideSourceUrl ? null : (sourceUrl.trim() || null),
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const saveResult = await meta.save(currentKey, input);
      if (!saveResult.ok) {
        setError(saveResult.error);
        notify.error("Metadados não salvos", { description: saveResult.error });
        setSaving(false);
        return;
      }

      notify.success("Asset atualizado");
      onSaved?.({ renamedTo });
      onOpenChange(false);
    } catch (err) {
      console.error("[asset-edit] save failed", err);
      setError("Erro ao salvar. Tente de novo.");
      notify.fromError(err, "Algo deu errado");
    } finally {
      setSaving(false);
    }
  };

  /** Algum campo foi alterado em relação ao que veio do banco? */
  const isDirty =
    title !== initial.title ||
    caption !== initial.caption ||
    author !== initial.author ||
    year !== initial.year ||
    sourceUrl !== initial.sourceUrl ||
    tagsRaw !== initial.tags.join(", ") ||
    filename !== (initial.filename ?? "");

  /** Fecha pedindo confirmação quando há alterações não salvas. */
  const requestClose = async () => {
    if (saving) return;
    if (isDirty) {
      const ok = await confirm({
        destructive: true,
        title: "Descartar alterações?",
        description: "As alterações feitas neste asset serão perdidas.",
        confirmLabel: "Descartar",
        cancelLabel: "Continuar editando",
      });
      if (!ok) return;
    }
    onOpenChange(false);
  };

  const describedBy = (name: FieldName, extra?: string) =>
    [fieldErrors[name] ? errorIdFor(name) : null, extra ?? null].filter(Boolean).join(" ") || undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
          return;
        }
        void requestClose();
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (saving) e.preventDefault(); }}
        onInteractOutside={(e) => { if (saving) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>Editar asset</DialogTitle>
          <DialogDescription>
            Ajuste os metadados visíveis no banco. Vazio = volta ao padrão.
          </DialogDescription>
        </DialogHeader>

        {preview}

        <form onSubmit={handleSave} noValidate className="contents" aria-describedby={error ? formErrorId : undefined}>
          <div className="flex flex-col gap-3">
            {config.allowRename && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={fieldId("filename")}>Nome do arquivo</Label>
                <Input
                  id={fieldId("filename")}
                  size="sm"
                  disabled={saving}
                  autoFocus
                  value={filename}
                  onChange={(e) => { setFilename(e.target.value); clearFieldError("filename"); }}
                  placeholder="meu-arquivo.png"
                  aria-invalid={!!fieldErrors.filename || undefined}
                  aria-describedby={describedBy("filename", fieldId("filename-hint"))}
                />
                {fieldErrors.filename && (
                  <FieldError id={errorIdFor("filename")} className="text-xs pl-1">{fieldErrors.filename}</FieldError>
                )}
                <p id={fieldId("filename-hint")} className="text-xs text-muted-foreground pl-1">
                  Mantenha a extensão original. Renomear move o arquivo no storage.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={fieldId("title")}>Título</Label>
              <Input
                id={fieldId("title")}
                size="sm"
                disabled={saving}
                autoFocus={!config.allowRename}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={fieldId("author")}>{config.authorLabel ?? "Autor"}</Label>
                <Input
                  id={fieldId("author")}
                  size="sm"
                  disabled={saving}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              {!config.hideYear && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={fieldId("year")}>Ano</Label>
                  <Input
                    id={fieldId("year")}
                    size="sm"
                    disabled={saving}
                    inputMode="numeric"
                    value={year}
                    onChange={(e) => { setYear(e.target.value); clearFieldError("year"); }}
                    aria-invalid={!!fieldErrors.year || undefined}
                    aria-describedby={describedBy("year")}
                  />
                  {fieldErrors.year && (
                    <FieldError id={errorIdFor("year")} className="text-xs pl-1">{fieldErrors.year}</FieldError>
                  )}
                </div>
              )}
            </div>

            {!config.hideCaption && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={fieldId("caption")}>Descrição</Label>
                <Textarea
                  id={fieldId("caption")}
                  disabled={saving}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={5}
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={fieldId("tags")}>Tags</Label>
              <Input
                id={fieldId("tags")}
                size="sm"
                disabled={saving}
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="separadas por vírgula"
              />
            </div>

            {!config.hideSourceUrl && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={fieldId("source")}>Link de origem</Label>
                <Input
                  id={fieldId("source")}
                  size="sm"
                  disabled={saving}
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => { setSourceUrl(e.target.value); clearFieldError("source"); }}
                  placeholder="https://"
                  aria-invalid={!!fieldErrors.source || undefined}
                  aria-describedby={describedBy("source")}
                />
                {fieldErrors.source && (
                  <FieldError id={errorIdFor("source")} className="text-xs pl-1">{fieldErrors.source}</FieldError>
                )}
              </div>
            )}
          </div>

          {error && (
            <FieldError id={formErrorId} className="text-xs pl-1 mt-3">{error}</FieldError>
          )}

          <DialogFooter className="mt-2 sm:justify-start">
            <Button type="submit" variant="default" loading={saving} loadingText="Salvando…">
              <span>Salvar</span>
            </Button>
            <Button type="button" variant="ghost" onClick={() => void requestClose()} disabled={saving}>
              <span>Cancelar</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
