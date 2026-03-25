"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const formats: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

interface ConvertedFile {
  name: string;
  url: string;
  size: number;
  originalSize: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ConversorFormatoPage() {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const convertFile = useCallback(
    (file: File): Promise<ConvertedFile> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          const fmt = formats.find((f) => f.value === outputFormat)!;
          canvas.toBlob(
            (blob) => {
              if (!blob) return;
              const baseName = file.name.replace(/\.[^.]+$/, "");
              resolve({
                name: `${baseName}.${fmt.ext}`,
                url: URL.createObjectURL(blob),
                size: blob.size,
                originalSize: file.size,
              });
            },
            outputFormat,
            0.92
          );
        };
        img.src = URL.createObjectURL(file);
      });
    },
    [outputFormat]
  );

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setProcessing(true);
    const promises = Array.from(files).map(convertFile);
    const res = await Promise.all(promises);
    setResults(res);
    setProcessing(false);
  };

  const handleDownload = (result: ConvertedFile) => {
    const link = document.createElement("a");
    link.download = result.name;
    link.href = result.url;
    link.click();
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

      <h1 className="text-2xl font-semibold tracking-tight">Conversor de Formato</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Converta imagens entre PNG, JPG e WebP direto no navegador.
      </p>

      <div className="space-y-6">
        <div className="max-w-xs space-y-2">
          <Label>Formato de saida</Label>
          <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formats.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-accent/30 p-10 text-center transition-colors hover:border-muted-foreground/50 hover:bg-accent/50"
        >
          <Upload className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Arraste imagens ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, WebP, GIF, BMP</p>
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
          <p className="text-sm text-muted-foreground">Convertendo...</p>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Resultados</h2>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(r.originalSize)} → {formatBytes(r.size)}
                    </p>
                  </div>
                  <Button onClick={() => handleDownload(r)} variant="ghost" size="icon">
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
