"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { ArrowLeft, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QrCodePage() {
  const [text, setText] = useState("https://overlens.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(300);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(() => {
    if (!canvasRef.current || !text.trim()) return;
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
    });
  }, [text, fgColor, bgColor, size]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

      <h1 className="text-2xl font-semibold tracking-tight">Gerador de QR Code</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Cole um link ou texto e gere um QR Code personalizado.
      </p>

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Conteudo</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor do QR</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="size-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <Input
                  size="sm"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor de fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="size-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <Input
                  size="sm"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tamanho: {size}px</Label>
            <Input
              type="range"
              min={100}
              max={600}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-2 cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="secondary">
              <Download className="size-4" />
              <span>Download PNG</span>
            </Button>
            <Button onClick={handleCopy} variant="secondary">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-center">
          <div className="rounded-xl border bg-white p-4">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
