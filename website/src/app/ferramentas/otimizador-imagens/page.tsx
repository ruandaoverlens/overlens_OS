"use client";

import { useState, useRef, useCallback, useEffect, useId } from "react";
import { SmDownloadLineIcon, SmCloseLineIcon, MdUploadLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { HeadingTitle } from "@/components/ui/heading";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/lib/notifications/toast";
import { cn } from "@/lib/utils";

/** Limites: evita travar o navegador com lotes grandes (tudo roda no client). */
const MAX_FILES = 20;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
/**
 * Teto por arquivo. Imagens corrompidas conseguem deixar `img.onload`/`onerror`
 * ou o callback do `toBlob` mudos: sem este limite o lote trava para sempre.
 */
const FILE_TIMEOUT_MS = 20_000;
/** Intervalo entre downloads: N cliques sincronos seriam bloqueados. */
const DOWNLOAD_GAP_MS = 300;

interface ImageResult {
  id: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
  url: string;
}

interface FileError {
  id: string;
  name: string;
  message: string;
}

let idSeq = 0;
const nextId = () => `f${++idSeq}`;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function OtimizadorImagensPage() {
  const uid = useId();
  const [quality, setQuality] = useState([80]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [errors, setErrors] = useState<FileError[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Cancelamento do lote: a flag corta o que ainda não começou e os listeners
  // rejeitam o arquivo que já está em processamento.
  const cancelRef = useRef(false);
  const cancelListeners = useRef(new Set<() => void>());
  // Todo object URL criado no lote, para revogar no próximo lote e ao desmontar.
  const objectUrls = useRef<string[]>([]);
  const processing = progress !== null;

  const revokeAll = useCallback(() => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = [];
  }, []);

  useEffect(() => revokeAll, [revokeAll]);

  /** Limita cada arquivo no tempo e deixa o Cancelar interromper o atual. */
  const guard = useCallback(<T,>(promise: Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        cancelListeners.current.delete(onCancel);
      };
      const onCancel = () => {
        cleanup();
        reject(new Error("Cancelado."));
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Demorou demais: o arquivo pode estar corrompido."));
      }, FILE_TIMEOUT_MS);
      cancelListeners.current.add(onCancel);
      promise.then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (err) => {
          cleanup();
          reject(err);
        },
      );
    });
  }, []);

  const processImage = useCallback(
    (file: File): Promise<ImageResult> => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          reject(new Error("Não é uma imagem."));
          return;
        }
        if (file.size > MAX_FILE_BYTES) {
          reject(new Error(`Arquivo acima de ${formatBytes(MAX_FILE_BYTES)}.`));
          return;
        }
        const img = new Image();
        const srcUrl = URL.createObjectURL(file);
        // Registrado já na criação: se o timeout disparar, `onload`/`onerror`
        // não revogam e o blob ficaria retido até o fim da aba.
        objectUrls.current.push(srcUrl);
        img.onerror = () => {
          URL.revokeObjectURL(srcUrl);
          reject(new Error("Não foi possível ler a imagem."));
        };
        img.onload = () => {
          URL.revokeObjectURL(srcUrl);
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;

          if (w > maxWidth[0]) {
            h = Math.round((h * maxWidth[0]) / w);
            w = maxWidth[0];
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Não foi possível otimizar a imagem."));
                return;
              }
              const url = URL.createObjectURL(blob);
              objectUrls.current.push(url);
              resolve({
                id: nextId(),
                name: file.name.replace(/\.[^.]+$/, ".jpg"),
                originalSize: file.size,
                optimizedSize: blob.size,
                url,
              });
            },
            "image/jpeg",
            quality[0] / 100
          );
        };
        img.src = srcUrl;
      });
    },
    [quality, maxWidth]
  );

  const processFiles = useCallback(
    async (list: FileList | File[]) => {
      let files = Array.from(list);
      if (!files.length) return;
      if (files.length > MAX_FILES) {
        notify.warning(`Limite de ${MAX_FILES} imagens por vez`, {
          description: `Apenas as ${MAX_FILES} primeiras serão otimizadas.`,
        });
        files = files.slice(0, MAX_FILES);
      }
      cancelRef.current = false;
      cancelListeners.current.clear();
      // O lote anterior sai da memória antes do novo começar.
      revokeAll();
      setErrors([]);
      setResults([]);
      setProgress({ done: 0, total: files.length });
      const ok: ImageResult[] = [];
      const failed: FileError[] = [];
      try {
        // Sequencial (e não Promise.all) para que o cancelamento interrompa
        // de verdade o que ainda não começou.
        for (const file of files) {
          if (cancelRef.current) break;
          try {
            ok.push(await guard(processImage(file)));
          } catch (err) {
            if (cancelRef.current) break;
            failed.push({
              id: nextId(),
              name: file.name,
              message: err instanceof Error ? err.message : "Erro desconhecido.",
            });
          }
          setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
        }
        setResults(ok);
        setErrors(failed);
        if (cancelRef.current) {
          notify.info(
            ok.length > 0
              ? `Otimização interrompida: ${ok.length} de ${files.length} concluídas`
              : "Otimização cancelada"
          );
        } else if (ok.length > 0) {
          notify.success(
            ok.length === 1 ? "1 imagem otimizada" : `${ok.length} imagens otimizadas`
          );
        } else if (failed.length > 0) {
          notify.error("Nenhuma imagem pôde ser otimizada");
        }
      } finally {
        setProgress(null);
        cancelRef.current = false;
        cancelListeners.current.clear();
      }
    },
    [processImage, guard, revokeAll]
  );

  const cancelProcessing = () => {
    cancelRef.current = true;
    // Interrompe também o arquivo em curso, não só os que ainda não começaram.
    cancelListeners.current.forEach((fn) => fn());
    cancelListeners.current.clear();
  };

  const removeResult = (id: string) => {
    setResults((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        objectUrls.current = objectUrls.current.filter((u) => u !== target.url);
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const removeError = (id: string) =>
    setErrors((prev) => prev.filter((e) => e.id !== id));

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) processFiles(files);
    // Permite selecionar os mesmos arquivos de novo.
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (processing) return;
    e.dataTransfer.dropEffect = "copy";
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Ignora "leave" disparado ao passar por filhos do dropzone.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (processing) return;
    processFiles(e.dataTransfer.files);
  };

  const handleDownload = (result: ImageResult) => {
    const link = document.createElement("a");
    link.download = result.name;
    link.href = result.url;
    link.click();
  };

  /** Serializado: N cliques no mesmo tick sao bloqueados pelo navegador. */
  const handleDownloadAll = async () => {
    for (const result of results) {
      handleDownload(result);
      await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_GAP_MS));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Otimizador de Imagens"
        description="Comprima e redimensione imagens direto no navegador. Nada é enviado para servidores."
        backHref="/ferramentas"
        backLabel="Ferramentas"
        className="mb-6"
      />

      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label id={`${uid}-quality-label`} htmlFor={`${uid}-quality`}>
              Qualidade: {quality[0]}%
            </Label>
            <Slider
              id={`${uid}-quality`}
              value={quality}
              onValueChange={setQuality}
              min={10}
              max={100}
              step={5}
              disabled={processing}
              aria-labelledby={`${uid}-quality-label`}
            />
          </div>
          <div className="space-y-2">
            <Label id={`${uid}-width-label`} htmlFor={`${uid}-width`}>
              Largura máxima: {maxWidth[0]}px
            </Label>
            <Slider
              id={`${uid}-width`}
              value={maxWidth}
              onValueChange={setMaxWidth}
              min={320}
              max={3840}
              step={80}
              disabled={processing}
              aria-labelledby={`${uid}-width-label`}
            />
          </div>
        </div>

        <button
          type="button"
          autoFocus
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={processing}
          aria-busy={processing || undefined}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-accent/30 p-10 text-center transition-colors hover:border-muted-foreground/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-wait disabled:opacity-60",
            dragging ? "border-foreground bg-accent/60" : "border-muted-foreground/25"
          )}
        >
          <MdUploadLineIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">
              {dragging ? "Solte as imagens aqui" : "Arraste imagens ou clique para selecionar"}
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WebP · até {MAX_FILES} imagens de {formatBytes(MAX_FILE_BYTES)}
            </p>
          </div>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
          aria-label="Selecionar imagens"
          tabIndex={-1}
        />

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <p role="status" className="flex-1 text-sm text-muted-foreground">
                Otimizando {Math.min(progress.done + 1, progress.total)}/{progress.total}…
              </p>
              <Button type="button" size="sm" variant="ghost" onClick={cancelProcessing}>
                Cancelar
              </Button>
            </div>
            <Progress
              value={Math.round((progress.done / progress.total) * 100)}
              aria-label="Progresso da otimização"
            />
          </div>
        )}

        {errors.length > 0 && (
          <ul
            role="alert"
            className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {errors.map((err) => (
              <li key={err.id} className="flex items-start justify-between gap-2">
                <span>
                  <span className="font-medium">{err.name}</span>: {err.message}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeError(err.id)}
                  aria-label={`Remover ${err.name} da lista`}
                >
                  <SmCloseLineIcon className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {results.length > 0 && (
          <div className="space-y-4" role="status" aria-live="polite">
            <div className="flex items-center justify-between">
              <HeadingTitle as="h2" size="sm">Resultados</HeadingTitle>
              {results.length > 1 && (
                <Button type="button" onClick={() => void handleDownloadAll()} variant="secondary" size="sm">
                  <SmDownloadLineIcon className="size-4" aria-hidden="true" />
                  <span>Baixar todos</span>
                </Button>
              )}
            </div>
            <ul className="space-y-2">
              {results.map((r) => {
                const savings = Math.round((1 - r.optimizedSize / r.originalSize) * 100);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(r.originalSize)} → {formatBytes(r.optimizedSize)}{" "}
                        <span className={savings >= 0 ? "text-success" : "text-warning"}>
                          ({savings >= 0 ? "-" : "+"}{Math.abs(savings)}%)
                        </span>
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={() => handleDownload(r)}
                          variant="ghost"
                          size="icon"
                          aria-label={`Baixar ${r.name}`}
                        >
                          <SmDownloadLineIcon className="size-4" aria-hidden="true" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Baixar</TooltipContent>
                    </Tooltip>
                    <Button
                      type="button"
                      onClick={() => removeResult(r.id)}
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${r.name} da lista`}
                    >
                      <SmCloseLineIcon className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
