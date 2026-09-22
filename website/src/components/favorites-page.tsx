"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSlashFocus } from "@/lib/use-slash-focus";
import { normalizeText, matchesNormalized } from "@/lib/normalize-text";
import { useLightboxItem } from "@/components/asset-page-shell";
import { useMounted } from "@/lib/use-mounted";
import Image from "next/image";
import Link from "next/link";
import { useFavorites, type FavoriteItem, type FavoriteType } from "@/lib/favorites";
import {
  SmGraphicEqLineIcon,
  SmPlaySolidIcon,
  SmAsteriskLineIcon,
  SmImageLineIcon,
  SmAppsLineIcon,
  SmContrastLineIcon,
  SmDocLineIcon,
  SmCognitionLineIcon,
  SmCloseLineIcon,
  SmFavoriteLineIcon,
  SmSearchLineIcon,
} from "@/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { EmptyState } from "@/components/empty-state";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { headingTitleVariants } from "@/components/ui/heading";
import { cn } from "@/lib/utils";
import { getGradient } from "@/lib/brand-gradients";

// Asset data & viewers
import { IMAGES, ImageLightbox } from "@/components/image-bank";
import { LOGOS, LogoModal } from "@/components/logos-bank";
import { COLORS, ColorDetail } from "@/components/color-bank";
import { VideoLightbox } from "@/components/video-bank";
import { footages } from "@/lib/footages";
import { tracks } from "@/lib/musicas";
import { useMusicPlayer } from "@/lib/music-player";

const typeLabels: Record<FavoriteType, string> = {
  audio: "Áudio",
  video: "Vídeo",
  logo: "Logo",
  image: "Imagem",
  icon: "Ícone",
  color: "Cor",
  typography: "Tipografia",
  reference: "Referência",
  doc: "Documento",
};

const typeIcons: Record<FavoriteType, React.ReactNode> = {
  audio: <SmGraphicEqLineIcon className="size-4" />,
  video: <SmPlaySolidIcon className="size-4" />,
  logo: <SmAsteriskLineIcon className="size-4" />,
  image: <SmImageLineIcon className="size-4" />,
  icon: <SmAppsLineIcon className="size-4" />,
  color: <SmContrastLineIcon className="size-4" />,
  typography: <SmDocLineIcon className="size-4" />,
  reference: <SmCognitionLineIcon className="size-4" />,
  doc: <SmDocLineIcon className="size-4" />,
};

const CARD_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

/** Rotas internas (ex.: /api/assets/preview) dependem da sessão — o otimizador não as alcança. */
function isUnoptimized(src: string) {
  return src.startsWith("/api/") || src.endsWith(".svg");
}

// ─── Card ───────────────────────────────────────────────────

function FavoriteThumb({ item }: { item: FavoriteItem }) {
  if (!item.thumbnail) {
    return (
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        {typeIcons[item.type]}
        <span className={headingTitleVariants({ size: "eyebrow" })}>
          {typeLabels[item.type]}
        </span>
      </div>
    );
  }

  if (item.type === "color") {
    return (
      <div
        className="w-full h-full"
        style={{ backgroundColor: item.thumbnail }}
        role="img"
        aria-label={`Amostra da cor ${item.title}`}
      />
    );
  }

  if (item.type === "video") {
    return (
      <video
        src={item.thumbnail}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={item.title}
        className="h-full w-full object-cover"
        onMouseEnter={(e) => {
          // Respeita "prefers-reduced-motion": sem autoplay no hover.
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          void e.currentTarget.play().catch(() => {});
        }}
        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
      />
    );
  }

  if (item.type === "logo") {
    return (
      // Moldura LITERAL: o favorito guarda a variante CLARA do logo (branca),
      // que só se lê sobre preto — nos dois temas.
      <div className="h-full w-full flex items-center justify-center bg-absolute-black p-6">
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={200}
          height={100}
          unoptimized
          className="max-w-[50%] max-h-[50%] w-auto h-auto object-contain"
        />
      </div>
    );
  }

  return (
    <Image
      src={item.thumbnail}
      alt={item.title}
      fill
      sizes={CARD_SIZES}
      unoptimized={isUnoptimized(item.thumbnail)}
      className="object-cover"
    />
  );
}

function FavoriteCard({
  item,
  onRemove,
  onClick,
}: {
  item: FavoriteItem;
  onRemove: () => void;
  onClick: () => void;
}) {
  const isDoc = item.type === "doc" && !!item.href;
  const mainClass =
    "block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-xl";

  const body = (
    <>
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-surface-950 flex items-center justify-center overflow-hidden">
        <FavoriteThumb item={item} />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-surface-200 truncate">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {item.subtitle ?? typeLabels[item.type]}
        </p>
      </div>
    </>
  );

  return (
    <div className="group relative rounded-xl border border-border bg-surface-950 overflow-hidden hover:border-foreground/20 hover:bg-surface-900 transition-all">
      {isDoc ? (
        <Link href={item.href!} className={mainClass} aria-label={`Abrir ${item.title}`}>
          {body}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={mainClass} aria-label={`Abrir ${item.title}`}>
          {body}
        </button>
      )}

      {/* Selo e botão flutuam sobre a miniatura (imagem ou amostra de cor):
          pílula escura literal, que não inverte com o tema. */}
      {/* Type badge */}
      <p className={cn(headingTitleVariants({ size: "eyebrow" }), "absolute top-2 left-2 px-2 py-0.5 rounded-full bg-absolute-black/60 text-absolute-white/85 pointer-events-none")}>
        {typeLabels[item.type]}
      </p>

      {/* Remove button: irmão do card, nunca dentro do botão principal */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remover ${item.title} dos favoritos`}
        className="absolute top-2 right-2 rounded-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto transition-opacity bg-absolute-black/60 hover:bg-absolute-black/80 text-absolute-white/70 hover:text-absolute-white"
        onClick={onRemove}
      >
        <SmCloseLineIcon className="size-4" />
      </Button>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

const FILTER_BASE = "h-8 rounded-full px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground";

export function FavoritesPage() {
  const { items, isFavorite, removeFavorite, toggleFavorite } = useFavorites();
  const { playTrack } = useMusicPlayer();
  // Filtro por tipo na URL (?type=image) para ser compartilhável / sobreviver ao voltar.
  const [typeParam, setTypeParam] = useUrlState<string>("type", "all");
  const activeFilter: FavoriteType | "all" =
    typeParam !== "all" && typeParam in typeLabels ? (typeParam as FavoriteType) : "all";
  const setActiveFilter = (next: FavoriteType | "all") => setTypeParam(next);

  // Busca na URL (?q=) com input local + debounce, como nos demais bancos.
  const [q, setQ] = useUrlState<string>("q", "");
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    // URL mudou externamente (voltar/avançar): sincroniza o input no render.
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  // O item aberto vive na URL (?item=<id>): compartilhável e o Back fecha o viewer.
  const [selectedId, openItem, closeItem] = useLightboxItem();
  const mounted = useMounted();

  const selectedFavorite = useMemo(
    () => (selectedId ? items.find((i) => i.id === selectedId) ?? null : null),
    [items, selectedId],
  );

  const imageViewer = useMemo(
    () => (selectedFavorite?.type === "image" ? IMAGES.find((img) => img.filename === selectedFavorite.id) ?? null : null),
    [selectedFavorite],
  );
  const logoViewer = useMemo(
    () => (selectedFavorite?.type === "logo" ? LOGOS.find((l) => l.name === selectedFavorite.id) ?? null : null),
    [selectedFavorite],
  );
  const colorViewer = useMemo(
    () => (selectedFavorite?.type === "color" ? COLORS.find((c) => c.name === selectedFavorite.id) ?? null : null),
    [selectedFavorite],
  );
  const videoViewer = useMemo(
    () => (selectedFavorite?.type === "video" ? footages.find((f) => f.id === selectedFavorite.id) ?? null : null),
    [selectedFavorite],
  );

  // `?item=` aponta para algo que não é (mais) favorito: limpa a chave da URL.
  // Só depois da montagem — os favoritos vêm do localStorage no primeiro efeito.
  const hasViewer = !!(imageViewer || logoViewer || colorViewer || videoViewer);
  useEffect(() => {
    if (!mounted || !selectedId || hasViewer) return;
    closeItem();
  }, [mounted, selectedId, hasViewer, closeItem]);

  // Get unique types present in favorites
  const presentTypes = Array.from(new Set(items.map((i) => i.type)));

  // Filter items (tipo + busca por título, subtítulo e tipo)
  const filtered = useMemo(() => {
    const needle = normalizeText(q);
    return items.filter((i) => {
      if (activeFilter !== "all" && i.type !== activeFilter) return false;
      if (!needle) return true;
      return (
        matchesNormalized(i.title, needle) ||
        matchesNormalized(i.subtitle ?? "", needle) ||
        matchesNormalized(typeLabels[i.type], needle)
      );
    });
  }, [items, activeFilter, q]);

  const hasFilters = q.trim().length > 0 || activeFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setActiveFilter("all");
  };

  // Handle click based on type
  const handleClick = (item: FavoriteItem) => {
    switch (item.type) {
      case "image":
        if (IMAGES.some((img) => img.filename === item.id)) openItem(item.id);
        break;
      case "logo":
        if (LOGOS.some((l) => l.name === item.id)) openItem(item.id);
        break;
      case "color":
        if (COLORS.some((c) => c.name === item.id)) openItem(item.id);
        break;
      case "video":
        if (footages.some((f) => f.id === item.id)) openItem(item.id);
        break;
      case "audio": {
        // O player é persistente (barra inferior): não abre viewer nem entra na URL.
        const track = tracks.find((t) => t.id === item.id);
        if (track) playTrack(track);
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Banner */}
      <Banner size="sm">
        <BannerImage gradient={getGradient("favoritos")} />
        <BannerContent>
          <BannerTitle>Favoritos</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Content */}
      <div className="container-content flex-1 overflow-y-auto pb-32 pt-4">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <EmptyState
              icon={<SmFavoriteLineIcon className="size-6" />}
              title="Nenhum favorito"
              description="Marque ativos como favoritos para acessá-los rapidamente."
              className="border-none"
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/assets">Explorar assets</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Busca */}
            <InputGroup size="sm" className="rounded-full">
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <SmSearchLineIcon />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                ref={searchRef}
                type="search"
                aria-label="Buscar nos favoritos…"
                aria-keyshortcuts="/"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Buscar nos favoritos…"
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

            {/* Filter tags */}
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filtrar por tipo">
              <button
                type="button"
                aria-pressed={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
                className={`${FILTER_BASE} ${
                  activeFilter === "all"
                    ? "bg-foreground text-background"
                    : "bg-accent text-foreground hover:bg-accent/80"
                }`}
              >
                Todos
              </button>
              {presentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={activeFilter === type}
                  onClick={() => setActiveFilter(type)}
                  className={`${FILTER_BASE} ${
                    activeFilter === type
                      ? "bg-foreground text-background"
                      : "bg-accent text-foreground hover:bg-accent/80"
                  }`}
                >
                  {typeLabels[type]}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <EmptyState
                variant="filtered"
                icon={<SmFavoriteLineIcon className="size-6" />}
                title="Nenhum favorito encontrado"
                description="Nenhum resultado para a busca ou o tipo selecionado."
                onClear={hasFilters ? clearFilters : undefined}
                className="border-none py-16"
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {filtered.map((item) => (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    onClick={() => handleClick(item)}
                    onRemove={() => removeFavorite(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Native viewers */}
      {imageViewer && (
        <ImageLightbox asset={imageViewer} onClose={closeItem} />
      )}
      {logoViewer && (
        <LogoModal asset={logoViewer} onClose={closeItem} />
      )}
      {colorViewer && (
        <ColorDetail color={colorViewer} onClose={closeItem} />
      )}
      {videoViewer && (
        <VideoLightbox
          footage={videoViewer}
          onClose={closeItem}
          isFavorited={isFavorite(videoViewer.id)}
          onFavorite={(id) => {
            const f = footages.find((ft) => ft.id === id);
            if (f) toggleFavorite({ id: f.id, type: "video", title: f.title, subtitle: f.author, thumbnail: f.previewUrl });
          }}
        />
      )}
    </div>
  );
}
