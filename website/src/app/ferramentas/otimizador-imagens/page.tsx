"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ImageResult {
  name: string;
  originalSize: number;
  optimizedSize: number;
  url: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function OtimizadorImagensPage() {
  const [quality, setQuality] = useState([80]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (file: File): Promise<ImageResult> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
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
              if (!blob) return;
              resolve({
                name: file.name.replace(/\.[^.]+$/, ".jpg"),
                originalSize: file.size,
                optimizedSize: blob.size,
                url: URL.createObjectURL(blob),
              });
            },
            "image/jpeg",
            quality[0] / 100
          );
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [quality, maxWidth]
  );

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setProcessing(true);
    const promises = Array.from(files).map(processImage);
    const res = await Promise.all(promises);
    setResults(res);
    setProcessing(false);
  };

  const handleDownload = (result: ImageResult) => {
    const link = document.createElement("a");
    link.download = result.name;
    link.href = result.url;
    link.click();
  };

  const handleDownloadAll = () => {
    results.forEach(handleDownload);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/ferramentas"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Botoes Magicos
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Otimizador de Imagens</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Comprima e redimensione imagens direto no navegador. Nada e enviado para servidores.
      </p>

      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Qualidade: {quality[0]}%</Label>
            <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <Label>Largura maxima: {maxWidth[0]}px</Label>
            <Slider value={maxWidth} onValueChange={setMaxWidth} min={320} max={3840} step={80} />
          </div>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-accent/30 p-10 text-center transition-colors hover:border-muted-foreground/50 hover:bg-accent/50"
        >
          <Upload className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Arraste imagens ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, WebP</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </div>

        {processing && (
          <p className="text-sm text-muted-foreground">Otimizando...</p>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Resultados</h2>
              {results.length > 1 && (
                <Button onClick={handleDownloadAll} variant="secondary" size="sm">
                  <Download className="size-4" />
                  <span>Baixar todos</span>
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {results.map((r, i) => {
                const savings = Math.round((1 - r.optimizedSize / r.originalSize) * 100);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(r.originalSize)} → {formatBytes(r.optimizedSize)}{" "}
                        <span className="text-green-500">(-{savings}%)</span>
                      </p>
                    </div>
                    <Button onClick={() => handleDownload(r)} variant="ghost" size="icon">
                      <Download className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
