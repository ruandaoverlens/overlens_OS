"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import QRCode from "qrcode";
// Ícone lucide mantido: não há equivalente de "copiar" em @/components/icons
// (ver src/components/icons/lucide-mapping.ts).
import { Copy } from "lucide-react";
import { SmDownloadLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { PageHeader } from "@/components/page-header";
import { notify } from "@/lib/notifications/toast";

// Só a forma longa: a mensagem de erro promete #RRGGBB e o `<input type="color">`
// não aceita a forma curta (receberia "#abc" e cairia para preto sem avisar).
const HEX_RE = /^#[0-9a-f]{6}$/i;

export default function QrCodePage() {
  const uid = useId();
  const [text, setText] = useState("https://overlens.com");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(300);
  const [copying, setCopying] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const textEmpty = !text.trim();
  const fgValid = HEX_RE.test(fgColor.trim());
  const bgValid = HEX_RE.test(bgColor.trim());
  const canRender = !textEmpty && fgValid && bgValid;

  const generate = useCallback(() => {
    if (!canvasRef.current || !canRender) return;
    // `toCanvas` devolve uma promessa: sem `.catch` uma falha vira rejeição
    // não tratada e o canvas fica com o desenho anterior, sem aviso.
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 2,
      color: { dark: fgColor.trim(), light: bgColor.trim() },
    })
      .then(() => setRenderError(null))
      .catch((err) => {
        setRenderError(
          err instanceof Error ? err.message : "Não foi possível gerar o QR Code.",
        );
      });
  }, [text, fgColor, bgColor, size, canRender]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    } catch (err) {
      notify.fromError(err, "Não foi possível baixar o QR Code");
    }
  };

  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCopying(true);
    try {
      canvas.toBlob(async (blob) => {
        try {
          // `toBlob` entrega `null` quando a conversão falha — sem este caminho
          // o botão ficaria preso em "Copiando…".
          if (!blob) throw new Error("Não foi possível gerar a imagem do QR Code.");
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          notify.success("Copiado");
        } catch (err) {
          notify.fromError(err, "Não foi possível copiar");
        } finally {
          setCopying(false);
        }
      });
    } catch (err) {
      // `toBlob` pode lançar de forma síncrona (ex.: canvas contaminado).
      notify.fromError(err, "Não foi possível copiar");
      setCopying(false);
    }
  };

  const ids = {
    text: `${uid}-text`,
    textError: `${uid}-text-error`,
    fg: `${uid}-fg`,
    fgError: `${uid}-fg-error`,
    fgPicker: `${uid}-fg-picker`,
    bg: `${uid}-bg`,
    bgError: `${uid}-bg-error`,
    bgPicker: `${uid}-bg-picker`,
    size: `${uid}-size`,
    renderError: `${uid}-render-error`,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Gerador de QR Code"
        description="Cole um link ou texto e gere um QR Code personalizado."
        backHref="/ferramentas"
        backLabel="Ferramentas"
        className="mb-6"
      />

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor={ids.text}>Conteúdo</Label>
            <Input
              id={ids.text}
              autoFocus
              value={text}
              onChange={(e) => { setText(e.target.value); setRenderError(null); }}
              placeholder="https://…"
              aria-invalid={textEmpty || undefined}
              aria-describedby={textEmpty ? ids.textError : undefined}
            />
            {textEmpty && (
              <FieldError id={ids.textError} className="text-xs pl-0">
                Informe um link ou texto para gerar o QR Code.
              </FieldError>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={ids.fg}>Cor do QR</Label>
              <div className="flex items-center gap-2">
                <input
                  id={ids.fgPicker}
                  type="color"
                  aria-label="Seletor da cor do QR"
                  value={fgValid ? fgColor.trim() : "#000000"}
                  onChange={(e) => { setFgColor(e.target.value); setRenderError(null); }}
                  className="size-10 cursor-pointer rounded-lg border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                />
                <Input
                  id={ids.fg}
                  size="sm"
                  value={fgColor}
                  onChange={(e) => { setFgColor(e.target.value); setRenderError(null); }}
                  aria-invalid={!fgValid || undefined}
                  aria-describedby={!fgValid ? ids.fgError : undefined}
                />
              </div>
              {!fgValid && (
                <FieldError id={ids.fgError} className="text-xs pl-0">
                  Use um HEX no formato #RRGGBB.
                </FieldError>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.bg}>Cor de fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  id={ids.bgPicker}
                  type="color"
                  aria-label="Seletor da cor de fundo"
                  value={bgValid ? bgColor.trim() : "#ffffff"}
                  onChange={(e) => { setBgColor(e.target.value); setRenderError(null); }}
                  className="size-10 cursor-pointer rounded-lg border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                />
                <Input
                  id={ids.bg}
                  size="sm"
                  value={bgColor}
                  onChange={(e) => { setBgColor(e.target.value); setRenderError(null); }}
                  aria-invalid={!bgValid || undefined}
                  aria-describedby={!bgValid ? ids.bgError : undefined}
                />
              </div>
              {!bgValid && (
                <FieldError id={ids.bgError} className="text-xs pl-0">
                  Use um HEX no formato #RRGGBB.
                </FieldError>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={ids.size}>Tamanho: {size}px</Label>
            <Input
              id={ids.size}
              type="range"
              min={100}
              max={600}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-2 cursor-pointer"
            />
          </div>

          {renderError && (
            <FieldError id={ids.renderError} className="text-xs pl-0">
              {renderError}
            </FieldError>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleDownload}
              variant="secondary"
              disabled={!canRender}
              aria-describedby={renderError ? ids.renderError : undefined}
            >
              <SmDownloadLineIcon className="size-4" aria-hidden="true" />
              <span>Download PNG</span>
            </Button>
            <Button
              type="button"
              onClick={handleCopy}
              variant="secondary"
              loading={copying}
              loadingText="Copiando…"
              disabled={!canRender}
              aria-describedby={renderError ? ids.renderError : undefined}
            >
              <Copy className="size-4" aria-hidden="true" />
              <span>Copiar</span>
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-center" role="status" aria-live="polite">
          {/* Branco absoluto nos dois temas: é a "folha" em volta do QR. A margem
              clara faz parte da zona de silêncio que os leitores precisam. */}
          <div className="rounded-xl border bg-absolute-white p-4">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`QR Code para ${text}`}
              aria-describedby={renderError ? ids.renderError : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
