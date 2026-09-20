"use client";

import { useState, useCallback, useId } from "react";
// Ícone lucide mantido: não há equivalente de "copiar" em @/components/icons
// (ver src/components/icons/lucide-mapping.ts).
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/lib/notifications/toast";

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

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copying, setCopying] = useState(false);
  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      notify.success("Copiado");
    } catch (err) {
      notify.fromError(err, "Não foi possível copiar");
    } finally {
      setCopying(false);
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      loading={copying}
      loadingText={`Copiando ${label}…`}
      aria-label={copying ? `Copiando ${label}…` : `Copiar ${label}`}
    >
      <Copy className="size-3.5" aria-hidden="true" />
    </Button>
  );
}

export default function ConversorCoresPage() {
  const uid = useId();
  const [hex, setHex] = useState("#0ea5e9");
  const [rgb, setRgb] = useState<RGB>({ r: 14, g: 165, b: 233 });
  const [hsl, setHsl] = useState<HSL>({ h: 199, s: 89, l: 48 });

  const hexValid = hexToRgb(hex) !== null;
  // O <input type="color"> só aceita #rrggbb; enquanto o HEX digitado for inválido, mostra a última cor válida.
  const pickerHex = hexValid
    ? (hex.startsWith("#") ? hex : `#${hex}`).toLowerCase()
    : rgbToHex(rgb.r, rgb.g, rgb.b);

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

  // Validação inline dos campos de entrada livre.
  const inRange = (v: number, min: number, max: number) =>
    Number.isFinite(v) && v >= min && v <= max;
  const rgbError =
    inRange(rgb.r, 0, 255) && inRange(rgb.g, 0, 255) && inRange(rgb.b, 0, 255)
      ? null
      : "Use valores de 0 a 255 em R, G e B.";
  const hslError =
    inRange(hsl.h, 0, 360) && inRange(hsl.s, 0, 100) && inRange(hsl.l, 0, 100)
      ? null
      : "Use H de 0 a 360 e S/L de 0 a 100.";

  const hexStr = hex;
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const ids = {
    picker: `${uid}-picker`,
    hex: `${uid}-hex`,
    hexError: `${uid}-hex-error`,
    r: `${uid}-r`,
    g: `${uid}-g`,
    b: `${uid}-b`,
    h: `${uid}-h`,
    s: `${uid}-s`,
    l: `${uid}-l`,
    rgbGroup: `${uid}-rgb-group`,
    hslGroup: `${uid}-hsl-group`,
    rgbError: `${uid}-rgb-error`,
    hslError: `${uid}-hsl-error`,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Conversor de Cores"
        description="Converta entre HEX, RGB e HSL instantaneamente."
        backHref="/ferramentas"
        backLabel="Ferramentas"
        className="mb-6"
      />

      <div className="grid gap-8 md:grid-cols-[1fr_200px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={ids.hex}>HEX</Label>
              <CopyButton text={hexStr} label="HEX" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id={ids.picker}
                type="color"
                aria-label="Seletor de cor"
                value={pickerHex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="size-12 cursor-pointer rounded-lg border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              />
              <Input
                id={ids.hex}
                autoFocus
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                placeholder="#000000"
                aria-invalid={!hexValid || undefined}
                aria-describedby={!hexValid ? ids.hexError : undefined}
              />
            </div>
            {!hexValid && (
              <FieldError id={ids.hexError} className="text-xs pl-0">
                Informe um HEX válido no formato #RRGGBB.
              </FieldError>
            )}
          </div>

          <div role="group" aria-labelledby={ids.rgbGroup} className="space-y-2">
            <div className="flex items-center justify-between">
              <span id={ids.rgbGroup} className="text-sm font-medium leading-none">RGB</span>
              <CopyButton text={rgbStr} label="RGB" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="space-y-1">
                <Input
                  id={ids.r}
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.r}
                  aria-invalid={rgbError ? true : undefined}
                  aria-describedby={rgbError ? ids.rgbError : undefined}
                  onChange={(e) => updateFromRgb(Number(e.target.value), rgb.g, rgb.b)}
                  size="sm"
                />
                <Label htmlFor={ids.r} className="pl-2 text-xs font-normal text-muted-foreground">R</Label>
              </div>
              <div className="space-y-1">
                <Input
                  id={ids.g}
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.g}
                  aria-invalid={rgbError ? true : undefined}
                  aria-describedby={rgbError ? ids.rgbError : undefined}
                  onChange={(e) => updateFromRgb(rgb.r, Number(e.target.value), rgb.b)}
                  size="sm"
                />
                <Label htmlFor={ids.g} className="pl-2 text-xs font-normal text-muted-foreground">G</Label>
              </div>
              <div className="space-y-1">
                <Input
                  id={ids.b}
                  type="number"
                  min={0}
                  max={255}
                  value={rgb.b}
                  aria-invalid={rgbError ? true : undefined}
                  aria-describedby={rgbError ? ids.rgbError : undefined}
                  onChange={(e) => updateFromRgb(rgb.r, rgb.g, Number(e.target.value))}
                  size="sm"
                />
                <Label htmlFor={ids.b} className="pl-2 text-xs font-normal text-muted-foreground">B</Label>
              </div>
            </div>
            {rgbError && (
              <FieldError id={ids.rgbError} className="text-xs pl-0">{rgbError}</FieldError>
            )}
          </div>

          <div role="group" aria-labelledby={ids.hslGroup} className="space-y-2">
            <div className="flex items-center justify-between">
              <span id={ids.hslGroup} className="text-sm font-medium leading-none">HSL</span>
              <CopyButton text={hslStr} label="HSL" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="space-y-1">
                <Input
                  id={ids.h}
                  type="number"
                  min={0}
                  max={360}
                  value={hsl.h}
                  aria-invalid={hslError ? true : undefined}
                  aria-describedby={hslError ? ids.hslError : undefined}
                  onChange={(e) => updateFromHsl(Number(e.target.value), hsl.s, hsl.l)}
                  size="sm"
                />
                <Label htmlFor={ids.h} className="pl-2 text-xs font-normal text-muted-foreground">H</Label>
              </div>
              <div className="space-y-1">
                <Input
                  id={ids.s}
                  type="number"
                  min={0}
                  max={100}
                  value={hsl.s}
                  aria-invalid={hslError ? true : undefined}
                  aria-describedby={hslError ? ids.hslError : undefined}
                  onChange={(e) => updateFromHsl(hsl.h, Number(e.target.value), hsl.l)}
                  size="sm"
                />
                <Label htmlFor={ids.s} className="pl-2 text-xs font-normal text-muted-foreground">S%</Label>
              </div>
              <div className="space-y-1">
                <Input
                  id={ids.l}
                  type="number"
                  min={0}
                  max={100}
                  value={hsl.l}
                  aria-invalid={hslError ? true : undefined}
                  aria-describedby={hslError ? ids.hslError : undefined}
                  onChange={(e) => updateFromHsl(hsl.h, hsl.s, Number(e.target.value))}
                  size="sm"
                />
                <Label htmlFor={ids.l} className="pl-2 text-xs font-normal text-muted-foreground">L%</Label>
              </div>
            </div>
            {hslError && (
              <FieldError id={ids.hslError} className="text-xs pl-0">{hslError}</FieldError>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="aspect-square w-full rounded-xl border"
            style={{ backgroundColor: pickerHex }}
            role="img"
            aria-label={`Amostra da cor ${hexStr}`}
          />
          <div
            role="status"
            aria-live="polite"
            className="space-y-1 text-xs text-muted-foreground"
          >
            <p>{hexStr}</p>
            <p>{rgbStr}</p>
            <p>{hslStr}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
