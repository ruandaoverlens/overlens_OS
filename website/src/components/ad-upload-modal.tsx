"use client";

import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import {
  Upload,
  UploadTrigger,
  UploadFile,
  UploadMessage,
} from "@/components/ui/upload";
import { AD_PLATFORMS, type AdType } from "@/lib/ads";

const MAX_SIZE_MB = 2048;

interface AdUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function AdUploadModal({ open, onOpenChange, onCreated }: AdUploadModalProps) {
  const [type, setType] = useState<AdType>("image");
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [ctr, setCtr] = useState("");
  const [retentionSeconds, setRetentionSeconds] = useState("");
  const [retentionPercent, setRetentionPercent] = useState("");
  const [conversion, setConversion] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const accept =
    type === "video"
      ? ".mp4,.mov,.webm,.avi"
      : ".jpg,.jpeg,.png,.webp,.avif";

  const reset = useCallback(() => {
    setType("image");
    setFiles([]);
    setTitle("");
    setPlatform("");
    setCtr("");
    setRetentionSeconds("");
    setRetentionPercent("");
    setConversion("");
    setNotes("");
    setError(null);
    setSubmitting(false);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        abortRef.current?.abort();
        reset();
      }
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const handleType = (next: AdType) => {
    setType(next);
    setFiles([]);
    if (next === "video") {
      setFiles([]);
    }
  };

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const incoming = Array.from(list);
      const oversized = incoming.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
      if (oversized.length > 0) {
        setError(`Arquivo(s) excedem ${MAX_SIZE_MB}MB`);
        return;
      }
      setError(null);
      if (type === "carousel") {
        setFiles((prev) => [...prev, ...incoming]);
      } else {
        setFiles(incoming.slice(0, 1));
      }
    },
    [type],
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveFile = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Informe um título");
      return;
    }
    if (files.length === 0) {
      setError("Selecione pelo menos um arquivo");
      return;
    }
    if (type === "carousel" && files.length < 2) {
      setError("Carrossel precisa de pelo menos 2 imagens");
      return;
    }
    if (type === "image" && files.length !== 1) {
      setError("Anúncio de imagem precisa de exatamente 1 arquivo");
      return;
    }
    if (type === "video" && files.length !== 1) {
      setError("Anúncio de vídeo precisa de exatamente 1 arquivo");
      return;
    }

    const form = new FormData();
    form.append("type", type);
    form.append("title", title.trim());
    if (platform) form.append("platform", platform);
    if (ctr) form.append("ctr", ctr);
    if (retentionSeconds) form.append("retention_seconds", retentionSeconds);
    if (retentionPercent) form.append("retention_percent", retentionPercent);
    if (conversion) form.append("conversion", conversion);
    if (notes.trim()) form.append("notes", notes.trim());
    files.forEach((f) => form.append("files", f));

    const abort = new AbortController();
    abortRef.current = abort;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        body: form,
        signal: abort.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Falha no upload (${res.status})`);
      }
      onCreated?.();
      handleOpenChange(false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message ?? "Erro ao criar anúncio");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20">
        <DialogHeader>
          <DialogTitle>Novo anúncio</DialogTitle>
          <DialogDescription>
            Registre um anúncio (imagem, vídeo ou carrossel) e suas métricas de performance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Type selector */}
          <div className="space-y-2">
            <Label>Tipo de anúncio</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "image", label: "Imagem" },
                  { value: "video", label: "Vídeo" },
                  { value: "carousel", label: "Carrossel" },
                ] as Array<{ value: AdType; label: string }>
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleType(opt.value)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    type === opt.value
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 text-white/55 hover:text-white/85 hover:border-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* File picker */}
          <Upload>
            <UploadTrigger accept={accept} multiple={type === "carousel"} onChange={handleFiles}>
              {type === "carousel" ? "Adicionar imagens" : "Selecionar arquivo"}
            </UploadTrigger>
            {error && <UploadMessage variant="error">{error}</UploadMessage>}
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <UploadFile name={f.name} onRemove={() => removeFile(i)} />
                </div>
                {type === "carousel" && files.length > 1 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveFile(i, -1)}
                      disabled={i === 0}
                      className="text-xs px-1.5 py-0.5 rounded text-white/40 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFile(i, 1)}
                      disabled={i === files.length - 1}
                      className="text-xs px-1.5 py-0.5 rounded text-white/40 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </Upload>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="new-ad-title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="new-ad-title"
              size="sm"
              placeholder="Ex.: Lançamento curso outubro — variação A"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="new-ad-platform">Plataforma</Label>
            <NativeSelect
              id="new-ad-platform"
              size="sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <NativeSelectOption value="">Selecione...</NativeSelectOption>
              {AD_PLATFORMS.map((p) => (
                <NativeSelectOption key={p.value} value={p.value}>{p.label}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Metrics */}
          <div className="space-y-3 pt-2 border-t border-[var(--surface-900)]">
            <p className="text-xs uppercase tracking-wider text-white/40">Performance (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-ad-ctr">CTR (%)</Label>
                <Input
                  id="new-ad-ctr"
                  size="sm"
                  inputMode="decimal"
                  placeholder="2.5"
                  value={ctr}
                  onChange={(e) => setCtr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-ad-conv">Conversão (%)</Label>
                <Input
                  id="new-ad-conv"
                  size="sm"
                  inputMode="decimal"
                  placeholder="1.2"
                  value={conversion}
                  onChange={(e) => setConversion(e.target.value)}
                />
              </div>
            </div>
            {type === "video" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-ad-rets">Retenção (s)</Label>
                  <Input
                    id="new-ad-rets"
                    size="sm"
                    inputMode="decimal"
                    placeholder="18"
                    value={retentionSeconds}
                    onChange={(e) => setRetentionSeconds(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-ad-retp">Retenção (%)</Label>
                  <Input
                    id="new-ad-retp"
                    size="sm"
                    inputMode="decimal"
                    placeholder="65"
                    value={retentionPercent}
                    onChange={(e) => setRetentionPercent(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="new-ad-notes">Notas</Label>
            <Textarea
              id="new-ad-notes"
              size="sm"
              rows={4}
              placeholder="Hook, contexto da campanha, aprendizados..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="default" size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enviando..." : "Criar anúncio"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
