"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HeadingTitle, headingTitleVariants } from "@/components/ui/heading";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FieldError } from "@/components/ui/field";
import { MediaCardGridSkeleton } from "@/components/skeletons";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  SmChartLineIcon,
  SmCloseLineIcon,
  SmSearchLineIcon,
  SmArrowBackIosNewLineIcon,
  SmArrowForwardIosLineIcon,
  SmPlaySolidIcon,
} from "@/components/icons";
import { useAuth, canUpload, canDelete } from "@/lib/auth";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import { useUrlState } from "@/lib/use-url-state";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { useLightboxItem } from "@/components/asset-page-shell";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { getGradient } from "@/lib/brand-gradients";
import {
  AD_PLATFORMS,
  formatPercent,
  formatSeconds,
  platformLabel,
  type Ad,
  type AdMedia,
} from "@/lib/ads";
import { AdUploadModal } from "@/components/ad-upload-modal";
import { notify } from "@/lib/notifications";

const SUPABASE_PREVIEW_BASE =
  "https://lqymftfphjexutgtvjuh.supabase.co/storage/v1/object/public/asset-previews/";
const SUPABASE_ORIGINAL_BASE =
  "https://lqymftfphjexutgtvjuh.supabase.co/storage/v1/object/public/platform-assets/";

const GRID_CLASS = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2";
const GRID_SIZES = "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

function mediaUrl(m: AdMedia): string {
  if (m.preview_path) {
    return SUPABASE_PREVIEW_BASE + encodeURI(m.preview_path);
  }
  return SUPABASE_ORIGINAL_BASE + encodeURI(m.storage_path);
}

function isVideoMime(mime: string | null | undefined): boolean {
  return !!mime && mime.startsWith("video/");
}

// ─── Hook: fetch ads ─────────────────────────────────────────

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    // Cancela a requisição anterior para que uma resposta lenta não sobrescreva a nova.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch("/api/ads", { cache: "no-store", signal: controller.signal });
      if (!res.ok) throw new Error(`Falha ao carregar anúncios (${res.status})`);
      const data = (await res.json()) as { ads: Ad[] };
      setAds(data.ads ?? []);
      setError(null);
    } catch (err) {
      if (isAbortError(err)) return;
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setAds([]);
      setError(msg);
      notify.error("Falha ao carregar anúncios", {
        description: msg,
        action: {
          label: "Tentar novamente",
          onClick: () => void refresh(),
        },
      });
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return { ads, loading, error, refresh, setAds };
}

// ─── Ad Card ─────────────────────────────────────────────────

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    // Chip sobre a mídia do anúncio: véu e texto são LITERAIS nos dois temas,
    // porque o fundo é a imagem, não a superfície do app.
    <div className="flex items-center gap-1 rounded-full bg-absolute-black/65 px-2 py-0.5 backdrop-blur-sm text-xs">
      <span className={cn(headingTitleVariants({ size: "eyebrow" }), "text-absolute-white/80")}>{label}</span>
      <span className="font-medium text-absolute-white tabular-nums">{value}</span>
    </div>
  );
}

function AdCard({ ad, onClick }: { ad: Ad; onClick: (trigger: HTMLButtonElement) => void }) {
  const firstMedia = ad.media[0];
  const isVideo = firstMedia && (ad.type === "video" || isVideoMime(firstMedia.mime_type));
  const videoRef = useRef<HTMLVideoElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleEnter = useCallback(() => {
    // Respeita "prefers-reduced-motion": nem autoplay, nem ciclo automático.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (isVideo) {
      videoRef.current?.play().catch(() => {});
    }
    if (ad.type === "carousel" && ad.media.length > 1) {
      carouselTimer.current = setInterval(() => {
        setCarouselIndex((i) => (i + 1) % ad.media.length);
      }, 900);
    }
  }, [ad.media.length, ad.type, isVideo]);

  const handleLeave = useCallback(() => {
    if (isVideo) {
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    }
    if (carouselTimer.current) {
      clearInterval(carouselTimer.current);
      carouselTimer.current = null;
      setCarouselIndex(0);
    }
  }, [isVideo]);

  useEffect(() => () => {
    if (carouselTimer.current) clearInterval(carouselTimer.current);
  }, []);

  const visibleMedia = ad.media[carouselIndex] ?? firstMedia;

  const hasMetrics = ad.ctr != null || ad.conversion != null || ad.retention_percent != null || ad.retention_seconds != null;

  return (
    <button
      type="button"
      onClick={(e) => onClick(e.currentTarget)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      aria-label={`Abrir anúncio ${ad.title}`}
      className="group relative block w-full overflow-hidden rounded-sm bg-surface-950 text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground aspect-square"
    >
      {visibleMedia && isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl(visibleMedia)}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      ) : visibleMedia ? (
        <Image
          src={mediaUrl(visibleMedia)}
          alt={ad.title}
          fill
          sizes={GRID_SIZES}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-surface-raised-2" />
      )}

      {/* Type/count badge — sobre a mídia: preto/branco literais nos dois temas. */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 text-xs">
        {ad.type === "carousel" && (
          <span className="rounded-full bg-absolute-black/65 px-2 py-0.5 font-medium text-absolute-white backdrop-blur-sm tabular-nums">
            {carouselIndex + 1}/{ad.media.length}
          </span>
        )}
        {ad.type === "video" && (
          <span className="rounded-full bg-absolute-black/65 px-1.5 py-0.5 text-absolute-white backdrop-blur-sm" aria-label="Vídeo">
            <SmPlaySolidIcon className="size-3" />
          </span>
        )}
        {ad.platform && (
          <span className="rounded-full bg-absolute-black/65 px-2 py-0.5 font-medium text-absolute-white/80 backdrop-blur-sm">
            {platformLabel(ad.platform)}
          </span>
        )}
      </div>

      {/* Metric chips */}
      {hasMetrics && (
        <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1 max-w-[60%]">
          {ad.ctr != null && <MetricChip label="CTR" value={formatPercent(ad.ctr)} />}
          {ad.retention_percent != null && (
            <MetricChip label="Ret" value={formatPercent(ad.retention_percent, 0)} />
          )}
          {ad.retention_seconds != null && ad.retention_percent == null && (
            <MetricChip label="Ret" value={formatSeconds(ad.retention_seconds)} />
          )}
          {ad.conversion != null && <MetricChip label="Conv" value={formatPercent(ad.conversion)} />}
        </div>
      )}

      {/* Bottom info on hover */}
      {/* Véu literal sobre a mídia: garante o branco do título nos dois temas. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-absolute-black/85 via-absolute-black/40 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <p className="text-xs font-medium text-absolute-white truncate">{ad.title}</p>
        {ad.platform && (
          <p className="text-xs text-absolute-white/70 mt-0.5">{platformLabel(ad.platform)}</p>
        )}
      </div>
    </button>
  );
}

// ─── Carousel viewer (lightbox) ─────────────────────────────

function CarouselViewer({ media, title }: { media: AdMedia[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = media[index];

  const go = useCallback((delta: number) => {
    setIndex((i) => (i + delta + media.length) % media.length);
  }, [media.length]);

  // Setas do teclado navegam entre os itens do carrossel.
  useEffect(() => {
    if (media.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [go, media.length]);

  if (!current) return null;

  const itemLabel = media.length > 1 ? `${title} — item ${index + 1} de ${media.length}` : title;

  return (
    <div className="relative flex flex-1 items-center justify-center min-h-[50vh] md:min-h-0">
      {isVideoMime(current.mime_type) ? (
        <video
          key={current.id}
          src={mediaUrl(current)}
          controls
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-label={itemLabel}
          className="max-w-full max-h-full rounded-lg object-contain"
        />
      ) : (
        <div key={current.id} className="relative w-full h-full min-h-0">
          <Image
            src={mediaUrl(current)}
            alt={itemLabel}
            fill
            sizes="100vw"
            className="rounded-lg object-contain"
            priority
          />
        </div>
      )}

      {media.length > 1 && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => go(-1)}
                // Pílula literal: a seta pode cair sobre a mídia, que não muda
                // com o tema — escuro com ícone branco funciona nos dois.
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-absolute-black/55 text-absolute-white/85 hover:bg-absolute-black/80 hover:text-absolute-white"
                aria-label="Anterior"
              >
                <SmArrowBackIosNewLineIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Item anterior (←)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-absolute-black/55 text-absolute-white/85 hover:bg-absolute-black/80 hover:text-absolute-white"
                aria-label="Próximo"
              >
                <SmArrowForwardIosLineIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Próximo item (→)</TooltipContent>
          </Tooltip>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center" role="group" aria-label="Itens do carrossel">
            {media.map((m, i) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className="group/dot size-10 flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                aria-label={`Item ${i + 1}`}
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40 group-hover/dot:bg-foreground/70"}`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Performance form (lightbox sidebar) ────────────────────

type MetricField = "ctr" | "conversion" | "retention_seconds" | "retention_percent";
const METRIC_FIELDS: MetricField[] = ["ctr", "conversion", "retention_seconds", "retention_percent"];

/**
 * Valida um campo numérico opcional. `percent` aceita 0–100; `seconds` aceita ≥ 0.
 * Retorna `value` (null quando vazio) e `error` quando inválido.
 */
function validateMetric(raw: string, kind: "percent" | "seconds"): { value: number | null; error?: string } {
  const t = raw.trim().replace(",", ".");
  if (!t) return { value: null };
  const n = Number(t);
  if (!Number.isFinite(n)) return { value: null, error: "Informe um número válido." };
  if (kind === "percent" && (n < 0 || n > 100)) return { value: null, error: "Use um valor entre 0 e 100." };
  if (kind === "seconds" && n < 0) return { value: null, error: "Use um valor maior ou igual a 0." };
  return { value: n };
}

function MetricInput({
  id,
  label,
  placeholder,
  value,
  error,
  disabled,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        ref={inputRef}
        id={id}
        size="sm"
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <FieldError id={errorId} className="text-xs">{error}</FieldError>
      )}
    </div>
  );
}

function PerformanceForm({
  ad,
  canEdit,
  onUpdated,
  onSavingChange,
  onDirtyChange,
}: {
  ad: Ad;
  canEdit: boolean;
  onUpdated: (patch: Partial<Ad>) => void;
  /** Avisa o lightbox enquanto o PATCH está em voo (trava Esc e clique fora). */
  onSavingChange?: (saving: boolean) => void;
  /** Avisa o lightbox quando há edições não salvas (guarda de descarte). */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState({
    title: ad.title,
    platform: ad.platform ?? "",
    ctr: ad.ctr == null ? "" : String(ad.ctr),
    retention_seconds: ad.retention_seconds == null ? "" : String(ad.retention_seconds),
    retention_percent: ad.retention_percent == null ? "" : String(ad.retention_percent),
    conversion: ad.conversion == null ? "" : String(ad.conversion),
    notes: ad.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<MetricField, string>>>({});
  const fieldRefs = useRef<Partial<Record<MetricField, HTMLInputElement | null>>>({});
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);

  /** Algum campo difere do que está salvo? */
  const isDirty =
    canEdit &&
    (draft.title !== ad.title ||
      draft.platform !== (ad.platform ?? "") ||
      draft.ctr !== (ad.ctr == null ? "" : String(ad.ctr)) ||
      draft.retention_seconds !== (ad.retention_seconds == null ? "" : String(ad.retention_seconds)) ||
      draft.retention_percent !== (ad.retention_percent == null ? "" : String(ad.retention_percent)) ||
      draft.conversion !== (ad.conversion == null ? "" : String(ad.conversion)) ||
      draft.notes !== (ad.notes ?? ""));

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Desmontou (ou trocou de anúncio): não deixa a guarda presa em "sujo".
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  // Keep draft in sync when the ad prop changes (e.g., navigated to a different ad)
  useEffect(() => {
    setDraft({
      title: ad.title,
      platform: ad.platform ?? "",
      ctr: ad.ctr == null ? "" : String(ad.ctr),
      retention_seconds: ad.retention_seconds == null ? "" : String(ad.retention_seconds),
      retention_percent: ad.retention_percent == null ? "" : String(ad.retention_percent),
      conversion: ad.conversion == null ? "" : String(ad.conversion),
      notes: ad.notes ?? "",
    });
    setFieldErrors({});
  }, [ad.id, ad.title, ad.platform, ad.ctr, ad.retention_seconds, ad.retention_percent, ad.conversion, ad.notes]);

  const setField = (name: MetricField, value: string) => {
    setDraft((d) => ({ ...d, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    if (error) setError(null);
  };

  /** Campos sem validação própria: só limpam o erro geral do formulário. */
  const setPlainField = (name: "title" | "platform" | "notes", value: string) => {
    setDraft((d) => ({ ...d, [name]: value }));
    if (error) setError(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    const errors: Partial<Record<MetricField, string>> = {};
    const ctr = validateMetric(draft.ctr, "percent");
    const conversion = validateMetric(draft.conversion, "percent");
    const retention_percent = validateMetric(draft.retention_percent, "percent");
    const retention_seconds = validateMetric(draft.retention_seconds, "seconds");
    if (ctr.error) errors.ctr = ctr.error;
    if (conversion.error) errors.conversion = conversion.error;
    if (ad.type === "video") {
      if (retention_percent.error) errors.retention_percent = retention_percent.error;
      if (retention_seconds.error) errors.retention_seconds = retention_seconds.error;
    }
    setFieldErrors(errors);
    const firstInvalid = METRIC_FIELDS.find((f) => errors[f]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: draft.title.trim() || ad.title,
        platform: draft.platform || null,
        ctr: ctr.value,
        retention_seconds: ad.type === "video" ? retention_seconds.value : null,
        retention_percent: ad.type === "video" ? retention_percent.value : null,
        conversion: conversion.value,
        notes: draft.notes.trim() || null,
      };
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao salvar");
      }
      onUpdated(body);
      notify.success("Anúncio atualizado");
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      notify.error("Falha ao salvar anúncio", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    // Read-only view
    return (
      <div className="space-y-4 text-sm">
        <HeadingTitle as="h2" size="eyebrow">Performance</HeadingTitle>
        <dl className="space-y-2">
          <ReadRow label="CTR" value={formatPercent(ad.ctr)} />
          <ReadRow label="Retenção (s)" value={formatSeconds(ad.retention_seconds)} />
          <ReadRow label="Retenção (%)" value={formatPercent(ad.retention_percent, 0)} />
          <ReadRow label="Conversão" value={formatPercent(ad.conversion)} />
          <ReadRow label="Plataforma" value={platformLabel(ad.platform)} />
        </dl>
        {ad.notes && (
          <div className="pt-3 border-t border-border">
            <HeadingTitle as="h3" size="eyebrow" className="mb-2">Notas</HeadingTitle>
            <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">{ad.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSave}
      noValidate
      aria-describedby={error ? fieldId("form-error") : undefined}
    >
      <HeadingTitle as="h2" size="eyebrow">Editar anúncio</HeadingTitle>

      <div className="space-y-2">
        <Label htmlFor={fieldId("title")}>Título</Label>
        <Input
          id={fieldId("title")}
          data-ad-title-input=""
          size="sm"
          autoFocus
          disabled={saving}
          value={draft.title}
          onChange={(e) => setPlainField("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("platform")}>Plataforma</Label>
        <NativeSelect
          id={fieldId("platform")}
          size="sm"
          disabled={saving}
          value={draft.platform}
          onChange={(e) => setPlainField("platform", e.target.value)}
        >
          <NativeSelectOption value="">Sem plataforma</NativeSelectOption>
          {AD_PLATFORMS.map((p) => (
            <NativeSelectOption key={p.value} value={p.value}>{p.label}</NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricInput
          id={fieldId("ctr")}
          disabled={saving}
          label="CTR (%)"
          placeholder="2.5"
          value={draft.ctr}
          error={fieldErrors.ctr}
          onChange={(v) => setField("ctr", v)}
          inputRef={(el) => { fieldRefs.current.ctr = el; }}
        />
        <MetricInput
          id={fieldId("conv")}
          disabled={saving}
          label="Conversão (%)"
          placeholder="1.2"
          value={draft.conversion}
          error={fieldErrors.conversion}
          onChange={(v) => setField("conversion", v)}
          inputRef={(el) => { fieldRefs.current.conversion = el; }}
        />
      </div>

      {ad.type === "video" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetricInput
            id={fieldId("ret-s")}
          disabled={saving}
            label="Retenção (s)"
            placeholder="18"
            value={draft.retention_seconds}
            error={fieldErrors.retention_seconds}
            onChange={(v) => setField("retention_seconds", v)}
            inputRef={(el) => { fieldRefs.current.retention_seconds = el; }}
          />
          <MetricInput
            id={fieldId("ret-p")}
          disabled={saving}
            label="Retenção (%)"
            placeholder="65"
            value={draft.retention_percent}
            error={fieldErrors.retention_percent}
            onChange={(v) => setField("retention_percent", v)}
            inputRef={(el) => { fieldRefs.current.retention_percent = el; }}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={fieldId("notes")}>Notas</Label>
        <Textarea
          id={fieldId("notes")}
          size="sm"
          disabled={saving}
          placeholder="Observações adicionais sobre o anúncio (hook, contexto, aprendizados…)"
          value={draft.notes}
          onChange={(e) => setPlainField("notes", e.target.value)}
          rows={5}
        />
      </div>

      {error && (
        <FieldError id={fieldId("form-error")} className="text-xs">{error}</FieldError>
      )}

      <Button type="submit" variant="default" size="sm" loading={saving} loadingText="Salvando…" className="w-full">
        <span>Salvar alterações</span>
      </Button>
    </form>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <dt className={headingTitleVariants({ size: "eyebrow" })}>{label}</dt>
      <dd className="text-sm text-surface-200 tabular-nums">{value}</dd>
    </div>
  );
}

// ─── Lightbox ───────────────────────────────────────────────

function AdLightbox({
  ad,
  onClose,
  onUpdated,
  onDeleted,
  onRestoreFocus,
}: {
  ad: Ad;
  onClose: () => void;
  onUpdated: (patch: Partial<Ad>) => void;
  onDeleted: () => void;
  /** Devolve o foco ao card que abriu o lightbox. */
  onRestoreFocus?: () => void;
}) {
  const { user } = useAuth();
  const canEdit = !!user && (user.role === "staff" || user.role === "admin");
  const isAdmin = !!user && canDelete(user.role);
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  // Enquanto o PATCH/DELETE está em voo, fechar deixaria a operação órfã.
  const busy = deleting || saving;

  /** Fecha pedindo confirmação quando há edições não salvas no formulário. */
  const requestClose = useCallback(async () => {
    if (busy) return;
    if (dirty) {
      const ok = await confirm({
        destructive: true,
        title: "Descartar alterações?",
        description: "As alterações feitas neste anúncio serão perdidas.",
        confirmLabel: "Descartar",
        cancelLabel: "Continuar editando",
      });
      if (!ok) return;
    }
    onClose();
  }, [busy, confirm, dirty, onClose]);

  const handleDelete = async () => {
    const ok = await confirm({
      destructive: true,
      title: "Excluir este anúncio?",
      description: "Os arquivos do anúncio também serão excluídos. Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ads/${ad.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Falha ao excluir");
      }
      notify.success("Anúncio excluído");
      onDeleted();
    } catch (err) {
      notify.fromError(err, "Falha ao excluir anúncio");
    } finally {
      setDeleting(false);
    }
  };

  const typeLabel = ad.type === "image" ? "Imagem" : ad.type === "video" ? "Vídeo" : `Carrossel · ${ad.media.length} itens`;

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) void requestClose(); }}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        className="max-w-none sm:max-w-none max-h-none w-screen h-svh rounded-none p-0 bg-background border-0 flex flex-col gap-0 overflow-hidden"
        aria-busy={busy || undefined}
        onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}
        onInteractOutside={(e) => { if (busy) e.preventDefault(); }}
        onCloseAutoFocus={(e) => { e.preventDefault(); onRestoreFocus?.(); }}
        onOpenAutoFocus={(e) => {
          // Sem isso o foco inicial cai em "Excluir"/"Fechar".
          const title = contentRef.current?.querySelector<HTMLElement>("[data-ad-title-input]");
          if (!title) return;
          e.preventDefault();
          title.focus();
        }}
      >
        <DialogTitle className="sr-only">{ad.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {typeLabel}{ad.platform ? ` · ${platformLabel(ad.platform)}` : ""}. Visualização do anúncio e suas métricas de performance.
        </DialogDescription>

        {/* Top bar */}
        <div className="flex items-start justify-between px-4 py-3 shrink-0 gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
              <span>{typeLabel}</span>
              {ad.platform && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{platformLabel(ad.platform)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isAdmin && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                loadingText="Excluindo…"
              >
                Excluir
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar"
                  disabled={busy}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => void requestClose()}
                >
                  <SmCloseLineIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Fechar (Esc)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-4 px-4 pb-4 overflow-y-auto md:overflow-hidden scrollbar-thin">
          <CarouselViewer media={ad.media} title={ad.title} />

          <aside
            aria-label="Performance do anúncio"
            className="w-full md:w-[340px] shrink-0 md:overflow-y-auto scrollbar-thin rounded-lg bg-surface-950 border border-border p-5"
          >
            <PerformanceForm
              ad={ad}
              canEdit={canEdit}
              onUpdated={onUpdated}
              onSavingChange={setSaving}
              onDirtyChange={setDirty}
            />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────

const TAG_BASE = "px-3 py-1 rounded-full text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground";
const TAG_ACTIVE = "bg-primary text-primary-foreground";
const TAG_INACTIVE = "bg-surface-900 text-surface-400 hover:text-surface-200";

export function AdBank() {
  const { user } = useAuth();
  const { ads, loading, error, refresh, setAds } = useAds();
  // A URL é a fonte de verdade dos filtros (?q=&type=&item=).
  const [q, setQ] = useUrlState<string>("q", "");
  const [activePlatform, setActivePlatform] = useUrlState<string>("type", "");
  const [selectedId, openItem, closeItem] = useLightboxItem();
  // Card que abriu o lightbox — recebe o foco de volta ao fechar.
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Busca: input local (digitação fluida) → debounce 250ms → URL.
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // URL mudou por fora (voltar/avançar, limpar filtros): sincroniza o input no render.
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);

  const canUploadAd = user && canUpload(user.role);
  // Atalho "/" foca a busca, como nos demais bancos.
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);
  // Entre a tecla e o resultado: grade atenuada em vez de silêncio.
  const searching = search !== q;

  const platforms = useMemo(() => {
    const set = new Set<string>();
    ads.forEach((a) => { if (a.platform) set.add(a.platform); });
    return Array.from(set).sort();
  }, [ads]);

  const filtered = useMemo(() => {
    // Busca insensível a acento: "anuncio" encontra "anúncio".
    const needle = normalizeText(q);
    return ads.filter((a) => {
      if (activePlatform && a.platform !== activePlatform) return false;
      if (!needle) return true;
      if (matchesNormalized(a.title, needle)) return true;
      if (a.notes && matchesNormalized(a.notes, needle)) return true;
      if (a.tags.some((t) => matchesNormalized(t, needle))) return true;
      return false;
    });
  }, [ads, q, activePlatform]);

  const hasFilters = q.trim().length > 0 || activePlatform !== "";
  const clearFilters = () => {
    // A plataforma sai da URL agora; a busca sai pelo debounce (evita duas
    // escritas concorrentes na mesma query string).
    setActivePlatform("");
    setSearch("");
  };

  const { visibleItems: paged, hasMore, setSentinel } = useInfiniteScroll(filtered);

  // `?item=` aponta para um anúncio que não existe (mais): limpa a URL após o carregamento.
  const selected = selectedId ? ads.find((a) => a.id === selectedId) ?? null : null;
  useEffect(() => {
    if (!loading && selectedId && !selected) closeItem();
  }, [loading, selectedId, selected, closeItem]);

  const handleUpdated = (patch: Partial<Ad>) => {
    if (!selectedId) return;
    setAds((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
  };

  const handleDeleted = () => {
    if (!selectedId) return;
    setAds((prev) => prev.filter((a) => a.id !== selectedId));
    closeItem();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={getGradient("banco-de-anuncios")} />
        <BannerContent>
          <BannerTitle>Banco de anúncios</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Search + Upload */}
      <div className="container-content flex items-center gap-2 pt-4 pb-3">
        <InputGroup size="sm" className="flex-1 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            ref={searchRef}
            type="search"
            aria-label="Buscar anúncios…"
            aria-keyshortcuts="/"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar anúncios…"
          />
          <InputGroupAddon align="inline-end" className="hidden sm:flex">
            <kbd
              aria-hidden="true"
              className="rounded border border-border/60 bg-surface-900 px-1.5 text-caption font-mono text-muted-foreground"
            >
              /
            </kbd>
          </InputGroupAddon>
        </InputGroup>
        {canUploadAd && (
          <Button type="button" variant="default" size="sm" className="shrink-0" onClick={() => setUploadOpen(true)}>
            <span>Novo anúncio</span>
          </Button>
        )}
      </div>

      {/* Platform filter */}
      {platforms.length > 0 && (
        <div className="container-content flex flex-wrap gap-1.5 pb-3" role="group" aria-label="Filtrar por plataforma">
          <button
            type="button"
            aria-pressed={activePlatform === ""}
            onClick={() => setActivePlatform("")}
            className={`${TAG_BASE} ${activePlatform === "" ? TAG_ACTIVE : TAG_INACTIVE}`}
          >
            Todos
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={activePlatform === p}
              onClick={() => setActivePlatform(activePlatform === p ? "" : p)}
              className={`${TAG_BASE} ${activePlatform === p ? TAG_ACTIVE : TAG_INACTIVE}`}
            >
              {platformLabel(p)}
            </button>
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && (
        <div className="container-content pb-2">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "anúncio" : "anúncios"}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="container-content flex-1 overflow-y-auto pb-4">
        {loading ? (
          <MediaCardGridSkeleton count={10} className={GRID_CLASS} />
        ) : error && ads.length === 0 ? (
          <EmptyState
            variant="error"
            icon={<SmChartLineIcon className="size-6" />}
            title="Não foi possível carregar os anúncios"
            description={error}
            onRetry={() => void refresh()}
            className="border-none py-16"
          />
        ) : filtered.length === 0 && !searching ? (
          ads.length === 0 ? (
            <EmptyState
              icon={<SmChartLineIcon className="size-6" />}
              title="Nenhum anúncio ainda"
              description="Registre um anúncio com suas métricas de performance."
              action={
                canUploadAd ? (
                  <Button type="button" variant="default" size="sm" onClick={() => setUploadOpen(true)}>
                    <span>Novo anúncio</span>
                  </Button>
                ) : undefined
              }
              className="border-none py-16"
            />
          ) : (
            <EmptyState
              variant="filtered"
              icon={<SmChartLineIcon className="size-6" />}
              title="Nenhum anúncio encontrado"
              description="Nenhum resultado para a busca ou a plataforma selecionada."
              onClear={hasFilters ? clearFilters : undefined}
              className="border-none py-16"
            />
          )
        ) : (
          <>
            <div
              aria-busy={searching || undefined}
              className={cn(GRID_CLASS, "transition-opacity", searching && "opacity-60")}
            >
              {paged.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onClick={(trigger) => {
                    triggerRef.current = trigger;
                    openItem(ad.id);
                  }}
                />
              ))}
            </div>
            {hasMore && <div ref={setSentinel} className="h-8" aria-hidden="true" />}
          </>
        )}
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
      </div>

      {selected && (
        <AdLightbox
          ad={selected}
          onClose={closeItem}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          onRestoreFocus={() => {
            // O card pode ter sumido (anúncio excluído): cai para a busca.
            const el = triggerRef.current;
            if (el?.isConnected) el.focus();
            else searchRef.current?.focus();
          }}
        />
      )}

      <AdUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onCreated={() => void refresh()}
      />
    </div>
  );
}
