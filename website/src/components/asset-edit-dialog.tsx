"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [title, setTitle] = useState(initial.title);
  const [caption, setCaption] = useState(initial.caption);
  const [author, setAuthor] = useState(initial.author);
  const [year, setYear] = useState(initial.year);
  const [sourceUrl, setSourceUrl] = useState(initial.sourceUrl);
  const [tagsRaw, setTagsRaw] = useState(initial.tags.join(", "));
  const [filename, setFilename] = useState(initial.filename ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setCaption(initial.caption);
    setAuthor(initial.author);
    setYear(initial.year);
    setSourceUrl(initial.sourceUrl);
    setTagsRaw(initial.tags.join(", "));
    setFilename(initial.filename ?? "");
    setError(null);
  }, [open, initial]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let currentKey = assetKey;
      let renamedTo: string | undefined;

      if (config.allowRename && config.folder && initial.filename && filename.trim() && filename.trim() !== initial.filename) {
        const renameResult = await meta.rename(config.folder, initial.filename, filename.trim());
        if (!renameResult.ok) {
          setError(renameResult.error);
          notify.error("Não foi possível renomear", { description: renameResult.error });
          setSaving(false);
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
      setError("Erro ao salvar. Tenta de novo.");
      notify.error("Algo deu errado", {
        description: (err as Error)?.message ?? "Erro inesperado",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <DialogHeader>
          <DialogTitle>Editar asset</DialogTitle>
          <DialogDescription>
            Ajuste os metadados visíveis no banco. Vazio = volta ao padrão.
          </DialogDescription>
        </DialogHeader>

        {preview}

        <div className="flex flex-col gap-3">
          {config.allowRename && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-filename">Nome do arquivo</Label>
              <Input
                id="asset-filename"
                size="sm"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="meu-arquivo.png"
              />
              <p className="text-xs text-white/40 pl-1">
                Mantenha a extensão original. Renomear move o arquivo no storage.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-title">Título</Label>
            <Input
              id="asset-title"
              size="sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-author">{config.authorLabel ?? "Autor"}</Label>
              <Input
                id="asset-author"
                size="sm"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            {!config.hideYear && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asset-year">Ano</Label>
                <Input
                  id="asset-year"
                  size="sm"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            )}
          </div>

          {!config.hideCaption && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-caption">Descrição</Label>
              <Textarea
                id="asset-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={5}
                className="min-h-[100px]"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="asset-tags">Tags</Label>
            <Input
              id="asset-tags"
              size="sm"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="separadas por vírgula"
            />
          </div>

          {!config.hideSourceUrl && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asset-source">Link de origem</Label>
              <Input
                id="asset-source"
                size="sm"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 pl-1">{error}</p>
        )}

        <DialogFooter className="mt-2 sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            <span>Cancelar</span>
          </Button>
          <Button variant="default" onClick={handleSave} disabled={saving}>
            <span>{saving ? "Salvando..." : "Salvar"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
