"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function hexToRgb(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

export default function ConversorCoresPage() {
  const [hex, setHex] = useState("#0ea5e9");
  const [rgb, setRgb] = useState<RGB>({ r: 14, g: 165, b: 233 });
  const [hsl, setHsl] = useState<HSL>({ h: 199, s: 89, l: 48 });

  const updateFromHex = useCallback((val: string) => {
    setHex(val);
    const parsed = hexToRgb(val);
    if (parsed) {
      setRgb(parsed);
      setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b));
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl({ h, s, l });
    const c = hslToRgb(h, s, l);
    setRgb(c);
    setHex(rgbToHex(c.r, c.g, c.b));
  }, []);

  const hexStr = hex;
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/ferramentas"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Botoes Magicos
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Conversor de Cores</h1>
      <p className="mt-1 mb-8 text-muted-foreground">
        Converta entre HEX, RGB e HSL instantaneamente.
      </p>

      <div className="grid gap-8 md:grid-cols-[1fr_200px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>HEX</Label>
              <CopyButton text={hexStr} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="size-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <Input
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>RGB</Label>
              <CopyButton text={rgbStr} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => updateFromRgb(Number(e.target.value), rgb.g, rgb.b)}
                size="sm"
              />
              <Input
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => updateFromRgb(rgb.r, Number(e.target.value), rgb.b)}
                size="sm"
              />
              <Input
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => updateFromRgb(rgb.r, rgb.g, Number(e.target.value))}
                size="sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pl-2">
              <span>R</span><span>G</span><span>B</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>HSL</Label>
              <CopyButton text={hslStr} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={(e) => updateFromHsl(Number(e.target.value), hsl.s, hsl.l)}
                size="sm"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={(e) => updateFromHsl(hsl.h, Number(e.target.value), hsl.l)}
                size="sm"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={(e) => updateFromHsl(hsl.h, hsl.s, Number(e.target.value))}
                size="sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pl-2">
              <span>H</span><span>S%</span><span>L%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="aspect-square w-full rounded-xl border"
            style={{ backgroundColor: hex }}
          />
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{hexStr}</p>
            <p>{rgbStr}</p>
            <p>{hslStr}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
