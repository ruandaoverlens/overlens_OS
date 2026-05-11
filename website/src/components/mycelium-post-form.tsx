"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SmCloseLineIcon,
  SmImageLineIcon,
} from "@/components/icons";
import { MYCELIUM_TYPES, type MyceliumType } from "@/lib/mycelium-types";
import {
  MyceliumAttachmentUploader,
  type AttachmentDraft,
} from "@/components/mycelium-attachment-uploader";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notifications";

interface MyceliumPostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

interface OgResponse {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

async function fileFromUrl(url: string): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const ext =
      blob.type && blob.type.split("/")[1]
        ? blob.type.split("/")[1].split(";")[0]
        : "jpg";
    const filename = `og-cover.${ext}`;
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  } catch {
    return null;
  }
}

export function MyceliumPostForm({
  open,
  onOpenChange,
  onCreated,
}: MyceliumPostFormProps) {
  const [type, setType] = useState<MyceliumType>("artigo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [ogLoading, setOgLoading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync coverPreview with cover File and revoke prior URLs.
  useEffect(() => {
    if (!cover) {
      setCoverPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(cover);
    setCoverPreview(objectUrl);
    return () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        /* noop */
      }
    };
  }, [cover]);

  const resetForm = useCallback(() => {
    setType("artigo");
    setTitle("");
    setDescription("");
    setUrl("");
    setTags([]);
    setTagInput("");
    setCover(null);
    setCoverPreview(null);
    // Revoke any attachment URLs that are still around.
    attachments.forEach((a) => {
      try {
        URL.revokeObjectURL(a.previewUrl);
      } catch {
        /* noop */
      }
    });
    setAttachments([]);
  }, [attachments]);

  const handleUrlBlur = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setOgLoading(true);
    try {
      const res = await fetch(
        `/api/mycelium/og?url=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) return;
      const data: OgResponse = await res.json();

      if (data.title && !title.trim()) {
        setTitle(data.title);
      }
      if (data.description && !description.trim()) {
        setDescription(data.description);
      }
      if (data.image && !cover) {
        const file = await fileFromUrl(data.image);
        if (file) setCover(file);
      }
    } catch (err) {
      console.error("[mycelium-post-form] OG fetch failed:", err);
    } finally {
      setOgLoading(false);
    }
  }, [url, title, description, cover]);

  const handleCoverChange = (file: File | null) => {
    setCover(file);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const next = tagInput.trim().replace(/^#/, "");
      if (next && !tags.includes(next)) {
        setTags([...tags, next]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      notify.warning("Título é obrigatório");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(
        "payload",
        JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
          tags,
        }),
      );
      if (cover) formData.append("cover", cover);
      attachments.forEach((a) => formData.append("attachments", a.file));

      const res = await fetch("/api/mycelium/create", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newId: string | undefined = data?.reference?.id ?? data?.id;
        if (newId && onCreated) onCreated(newId);
        resetForm();
        onOpenChange(false);
        notify.success("Post criado");
      } else {
        let detail = "";
        try {
          const errData = await res.json();
          if (errData?.error) detail = errData.error;
        } catch {
          /* noop */
        }
        notify.error("Falha ao salvar post", {
          description: detail || `Erro ${res.status}`,
        });
      }
    } catch (err) {
      console.error("[mycelium-post-form] submit failed:", err);
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      notify.error("Falha ao salvar post", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg overflow-hidden"
      >
        <SheetHeader>
          <SheetTitle className="text-lg">Nova referência</SheetTitle>
          <SheetDescription>
            Compartilhe um artigo, vídeo, imagem ou outro material com a rede.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-4 px-4 py-2 flex flex-col gap-4">
          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as MyceliumType)}
            >
              <SelectTrigger id="mycelium-type">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {MYCELIUM_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-url">
              Link / URL{" "}
              {ogLoading && (
                <span className="text-xs text-muted-foreground font-normal">
                  carregando metadados...
                </span>
              )}
            </Label>
            <Input
              id="mycelium-url"
              type="url"
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
            />
          </div>

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mycelium-title"
              type="text"
              placeholder="Dê um título à referência"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-description">Descrição</Label>
            <Textarea
              id="mycelium-description"
              placeholder="Por que vale a pena? Qual contexto?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="sm"
            />
          </div>

          {/* Capa */}
          <div className="flex flex-col gap-1.5">
            <Label>Capa</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                handleCoverChange(file);
                e.target.value = "";
              }}
            />
            {coverPreview ? (
              <div className="relative w-full rounded-[12px] overflow-hidden bg-accent/60 border border-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt="Capa"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleCoverChange(null)}
                  className="absolute top-2 right-2 flex items-center justify-center size-7 rounded-full bg-background/90 text-foreground border border-foreground/20 shadow-sm hover:bg-destructive hover:text-white transition-colors"
                  aria-label="Remover capa"
                >
                  <SmCloseLineIcon className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 w-full h-32 rounded-[12px] border-2 border-dashed border-foreground/20 bg-accent/30 text-sm text-muted-foreground transition-colors hover:bg-accent/50",
                )}
              >
                <SmImageLineIcon className="size-6 opacity-60" />
                <span>Adicionar capa</span>
              </button>
            )}
          </div>

          {/* Mídias adicionais */}
          <div className="flex flex-col gap-1.5">
            <Label>Mídias adicionais</Label>
            <MyceliumAttachmentUploader
              files={attachments}
              onChange={setAttachments}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mycelium-tag-input">Tags</Label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-[12px] border-2 border-transparent bg-accent/50 dark:bg-input/30 px-2 py-2 min-h-12 focus-within:border-input focus-within:bg-transparent dark:focus-within:bg-transparent transition-colors">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary/80 dark:bg-accent/80 text-secondary-foreground px-2.5 py-1 text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 inline-flex items-center justify-center rounded-full hover:bg-foreground/10 size-4"
                    aria-label={`Remover ${tag}`}
                  >
                    <SmCloseLineIcon className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id="mycelium-tag-input"
                type="text"
                placeholder={
                  tags.length === 0 ? "Enter pra adicionar tags" : ""
                }
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 min-w-[100px] bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground py-1 px-2"
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="flex-1"
          >
            {submitting ? "Publicando..." : "Publicar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
