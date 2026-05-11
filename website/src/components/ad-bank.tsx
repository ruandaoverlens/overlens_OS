"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  SmCloseLineIcon,
  SmSearchLineIcon,
  SmArrowBackIosNewLineIcon,
  SmArrowForwardIosLineIcon,
  SmPlaySolidIcon,
} from "@/components/icons";
import { useAuth, canUpload, canDelete } from "@/lib/auth";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
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

const AD_GRADIENT = "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #A8DFA9 100%)";

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

function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ads", { cache: "no-store" });
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const data = (await res.json()) as { ads: Ad[] };
      setAds(data.ads ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setAds([]);
      notify.error("Falha ao carregar anúncios", {
        description: msg,
        action: {
          label: "Tentar novamente",
          onClick: () => void refresh(),
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ads, loading, refresh, setAds };
}

// ─── Ad Card ─────────────────────────────────────────────────

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 backdrop-blur-sm">
      <span className="text-[9px] uppercase tracking-wider text-white/50">{label}</span>
      <span className="text-[10px] font-medium text-white tabular-nums">{value}</span>
    </div>
  );
}

function AdCard({ ad, onClick }: { ad: Ad; onClick: () => void }) {
  const firstMedia = ad.media[0];
  const isVideo = firstMedia && (ad.type === "video" || isVideoMime(firstMedia.mime_type));
  const videoRef = useRef<HTMLVideoElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleEnter = useCallback(() => {
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group relative block w-full overflow-hidden rounded-sm bg-[var(--surface-950)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white aspect-square"
    >
      {visibleMedia && isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl(visibleMedia)}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      ) : visibleMedia ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(visibleMedia)}
          alt={ad.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-white/5" />
      )}

      {/* Type/count badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        {ad.type === "carousel" && (
          <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm tabular-nums">
            {carouselIndex + 1}/{ad.media.length}
          </span>
        )}
        {ad.type === "video" && (
          <span className="rounded-full bg-black/65 px-1.5 py-0.5 text-white backdrop-blur-sm">
            <SmPlaySolidIcon className="size-3" />
          </span>
        )}
        {ad.platform && (
          <span className="rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
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
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="text-[12px] font-medium text-white truncate">{ad.title}</p>
        {ad.platform && (
          <p className="text-[10px] text-white/55 mt-0.5">{platformLabel(ad.platform)}</p>
        )}
      </div>
    </div>
  );
}

// ─── Carousel viewer (lightbox) ─────────────────────────────

function CarouselViewer({ media }: { media: AdMedia[] }) {
  const [index, setIndex] = useState(0);
  const current = media[index];

  if (!current) return null;

  const go = (delta: number) => {
    setIndex((i) => (i + delta + media.length) % media.length);
  };

  return (
    <div className="relative flex flex-1 items-center justify-center min-h-0">
      {isVideoMime(current.mime_type) ? (
        <video
          key={current.id}
          src={mediaUrl(current)}
          controls
          autoPlay
          loop
          playsInline
          className="max-w-full max-h-full rounded-lg object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current.id}
          src={mediaUrl(current)}
          alt=""
          className="max-w-full max-h-full rounded-lg object-contain"
        />
      )}

      {media.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/55 text-white/85 hover:bg-black/80 hover:text-white transition flex items-center justify-center"
            aria-label="Anterior"
          >
            <SmArrowBackIosNewLineIcon />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/55 text-white/85 hover:bg-black/80 hover:text-white transition flex items-center justify-center"
            aria-label="Próximo"
          >
            <SmArrowForwardIosLineIcon />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {media.map((m, i) => (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Performance form (lightbox sidebar) ────────────────────

function PerformanceForm({
  ad,
  canEdit,
  onUpdated,
}: {
  ad: Ad;
  canEdit: boolean;
  onUpdated: (patch: Partial<Ad>) => void;
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
  }, [ad.id, ad.title, ad.platform, ad.ctr, ad.retention_seconds, ad.retention_percent, ad.conversion, ad.notes]);

  const parseNum = (s: string): number | null => {
    const t = s.trim().replace(",", ".");
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: draft.title.trim() || ad.title,
        platform: draft.platform || null,
        ctr: parseNum(draft.ctr),
        retention_seconds: parseNum(draft.retention_seconds),
        retention_percent: parseNum(draft.retention_percent),
        conversion: parseNum(draft.conversion),
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
        <h3 className="text-xs uppercase tracking-wider text-white/40">Performance</h3>
        <dl className="space-y-2">
          <ReadRow label="CTR" value={formatPercent(ad.ctr)} />
          <ReadRow label="Retenção (s)" value={formatSeconds(ad.retention_seconds)} />
          <ReadRow label="Retenção (%)" value={formatPercent(ad.retention_percent, 0)} />
          <ReadRow label="Conversão" value={formatPercent(ad.conversion)} />
          <ReadRow label="Plataforma" value={platformLabel(ad.platform)} />
        </dl>
        {ad.notes && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Notas</p>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{ad.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-wider text-white/40">Editar anúncio</h3>

      <div className="space-y-2">
        <Label htmlFor="ad-title">Título</Label>
        <Input
          id="ad-title"
          size="sm"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-platform">Plataforma</Label>
        <NativeSelect
          id="ad-platform"
          size="sm"
          value={draft.platform}
          onChange={(e) => setDraft((d) => ({ ...d, platform: e.target.value }))}
        >
          <NativeSelectOption value="">Sem plataforma</NativeSelectOption>
          {AD_PLATFORMS.map((p) => (
            <NativeSelectOption key={p.value} value={p.value}>{p.label}</NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="ad-ctr">CTR (%)</Label>
          <Input
            id="ad-ctr"
            size="sm"
            inputMode="decimal"
            placeholder="2.5"
            value={draft.ctr}
            onChange={(e) => setDraft((d) => ({ ...d, ctr: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-conv">Conversão (%)</Label>
          <Input
            id="ad-conv"
            size="sm"
            inputMode="decimal"
            placeholder="1.2"
            value={draft.conversion}
            onChange={(e) => setDraft((d) => ({ ...d, conversion: e.target.value }))}
          />
        </div>
      </div>

      {ad.type === "video" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="ad-ret-s">Retenção (s)</Label>
            <Input
              id="ad-ret-s"
              size="sm"
              inputMode="decimal"
              placeholder="18"
              value={draft.retention_seconds}
              onChange={(e) => setDraft((d) => ({ ...d, retention_seconds: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-ret-p">Retenção (%)</Label>
            <Input
              id="ad-ret-p"
              size="sm"
              inputMode="decimal"
              placeholder="65"
              value={draft.retention_percent}
              onChange={(e) => setDraft((d) => ({ ...d, retention_percent: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ad-notes">Notas</Label>
        <Textarea
          id="ad-notes"
          size="sm"
          placeholder="Observações adicionais sobre o anúncio (hook, contexto, aprendizados...)"
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          rows={5}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button variant="default" size="sm" onClick={handleSave} disabled={saving} className="w-full">
        <span>{saving ? "Salvando..." : "Salvar alterações"}</span>
      </Button>
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <dt className="text-xs uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 tabular-nums">{value}</dd>
    </div>
  );
}

// ─── Lightbox ───────────────────────────────────────────────

function AdLightbox({
  ad,
  onClose,
  onUpdated,
  onDeleted,
}: {
  ad: Ad;
  onClose: () => void;
  onUpdated: (patch: Partial<Ad>) => void;
  onDeleted: () => void;
}) {
  const { user } = useAuth();
  const canEdit = !!user && (user.role === "staff" || user.role === "admin");
  const isAdmin = !!user && canDelete(user.role);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirm("Excluir este anúncio e seus arquivos?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ads/${ad.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Falha ao excluir");
      }
      onDeleted();
      notify.success("Anúncio removido");
    } catch (err) {
      const msg = (err as Error).message;
      notify.error("Falha ao salvar anúncio", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-start justify-between px-4 py-3 shrink-0 gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">{ad.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-white/40">
              {ad.type === "image" ? "Imagem" : ad.type === "video" ? "Vídeo" : `Carrossel · ${ad.media.length} itens`}
            </span>
            {ad.platform && (
              <>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/40">{platformLabel(ad.platform)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              <span>{deleting ? "Excluindo..." : "Excluir"}</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <SmCloseLineIcon />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0 gap-4 px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        <CarouselViewer media={ad.media} />

        <aside className="w-[340px] shrink-0 overflow-y-auto rounded-lg bg-white/[0.03] border border-white/5 p-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20">
          <PerformanceForm ad={ad} canEdit={canEdit} onUpdated={onUpdated} />
        </aside>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function AdBank() {
  const { user } = useAuth();
  const { ads, loading, refresh, setAds } = useAds();
  const [search, setSearch] = useState("");
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const canUploadAd = user && canUpload(user.role);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    ads.forEach((a) => { if (a.platform) set.add(a.platform); });
    return Array.from(set).sort();
  }, [ads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ads.filter((a) => {
      if (activePlatform && a.platform !== activePlatform) return false;
      if (!q) return true;
      if (a.title.toLowerCase().includes(q)) return true;
      if (a.notes && a.notes.toLowerCase().includes(q)) return true;
      if (a.tags.some((t) => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [ads, search, activePlatform]);

  const { visibleItems: paged, hasMore, setSentinel } = useInfiniteScroll(filtered);

  const selected = selectedId ? ads.find((a) => a.id === selectedId) ?? null : null;

  const handleUpdated = (patch: Partial<Ad>) => {
    if (!selectedId) return;
    setAds((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
  };

  const handleDeleted = () => {
    if (!selectedId) return;
    setAds((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={AD_GRADIENT} />
        <BannerContent>
          <BannerTitle>Banco de anúncios</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Search + Upload */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 max-w-[1920px] mx-auto w-full">
        <InputGroup size="sm" className="flex-1 rounded-full">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SmSearchLineIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar anúncios..."
          />
        </InputGroup>
        {canUploadAd && (
          <Button variant="default" size="sm" className="shrink-0" onClick={() => setUploadOpen(true)}>
            <span>Novo anúncio</span>
          </Button>
        )}
      </div>

      {/* Platform filter */}
      {platforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3 max-w-[1920px] mx-auto w-full">
          <button
            onClick={() => setActivePlatform(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activePlatform === null
                ? "bg-white text-black"
                : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
            }`}
          >
            Todos
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform((cur) => (cur === p ? null : p))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activePlatform === p
                  ? "bg-white text-black"
                  : "bg-[var(--surface-900)] text-[var(--surface-400)] hover:text-[var(--surface-200)]"
              }`}
            >
              {platformLabel(p)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 max-w-[1920px] mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-white/40">Carregando anúncios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-white/40">
              {ads.length === 0
                ? "Nenhum anúncio adicionado ainda."
                : "Nenhum anúncio encontrado para esses filtros."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {paged.map((ad) => (
                <AdCard key={ad.id} ad={ad} onClick={() => setSelectedId(ad.id)} />
              ))}
            </div>
            {hasMore && (
              <div ref={setSentinel} className="flex items-center justify-center py-8">
                <p className="text-xs text-white/30">Carregando mais...</p>
              </div>
            )}
          </>
        )}
        <div className="h-[200px] w-full shrink-0" aria-hidden="true" />
      </div>

      {selected && (
        <AdLightbox
          ad={selected}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}

      <AdUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onCreated={() => {
          notify.success("Anúncio adicionado");
          void refresh();
        }}
      />
    </div>
  );
}
