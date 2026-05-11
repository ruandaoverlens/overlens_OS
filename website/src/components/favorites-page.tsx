"use client";

import { useState } from "react";
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
} from "@/components/icons";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Banner,
  BannerImage,
  BannerContent,
  BannerTitle,
} from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

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
};

// ─── Card ───────────────────────────────────────────────────

function FavoriteCard({
  item,
  onRemove,
  onClick,
}: {
  item: FavoriteItem;
  onRemove: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer"
    >
      {/* Thumbnail area */}
      <div className="aspect-video bg-[var(--surface-950)] flex items-center justify-center overflow-hidden">
        {item.thumbnail ? (
          item.type === "color" ? (
            <div
              className="w-full h-full"
              style={{ backgroundColor: item.thumbnail }}
            />
          ) : item.type === "video" ? (
            <video
              src={item.thumbnail}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
            />
          ) : item.type === "logo" ? (
            <div className="h-full w-full flex items-center justify-center bg-[var(--surface-950)] p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail}
                alt={item.title}
                className="max-w-[50%] max-h-[50%] object-contain"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnail}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/20">
            {typeIcons[item.type]}
            <span className="text-[10px] uppercase tracking-wider">
              {typeLabels[item.type]}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-white/80 truncate">
          {item.title}
        </p>
        <p className="text-xs text-white/40 mt-0.5 truncate">
          {item.subtitle ?? typeLabels[item.type]}
        </p>
      </div>

      {/* Type badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/60 uppercase tracking-wider">
        {typeLabels[item.type]}
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white/60 hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <SmCloseLineIcon className="size-3.5" />
      </Button>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────

export function FavoritesPage() {
  const { items, isFavorite, removeFavorite, toggleFavorite } = useFavorites();
  const { playTrack } = useMusicPlayer();
  const [activeFilter, setActiveFilter] = useState<FavoriteType | "all">("all");

  // Viewers state
  const [imageViewer, setImageViewer] = useState<typeof IMAGES[number] | null>(null);
  const [logoViewer, setLogoViewer] = useState<typeof LOGOS[number] | null>(null);
  const [colorViewer, setColorViewer] = useState<typeof COLORS[number] | null>(null);
  const [videoViewer, setVideoViewer] = useState<typeof footages[number] | null>(null);

  // Get unique types present in favorites
  const presentTypes = Array.from(new Set(items.map((i) => i.type)));

  // Filter items
  const filtered = activeFilter === "all"
    ? items
    : items.filter((i) => i.type === activeFilter);

  // Handle click based on type
  const handleClick = (item: FavoriteItem) => {
    switch (item.type) {
      case "image": {
        const asset = IMAGES.find((img) => img.filename === item.id);
        if (asset) setImageViewer(asset);
        break;
      }
      case "logo": {
        const asset = LOGOS.find((l) => l.name === item.id);
        if (asset) setLogoViewer(asset);
        break;
      }
      case "color": {
        const asset = COLORS.find((c) => c.name === item.id);
        if (asset) setColorViewer(asset);
        break;
      }
      case "video": {
        const asset = footages.find((f) => f.id === item.id);
        if (asset) setVideoViewer(asset);
        break;
      }
      case "audio": {
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
        <BannerImage gradient="linear-gradient(135deg, #F4C3CC 0%, #F8D8DE 50%, #FCF0F2 100%)" />
        <BannerContent>
          <BannerTitle>Favoritos</BannerTitle>
        </BannerContent>
      </Banner>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-[130px] pt-4">
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Empty className="border-none">
              <EmptyHeader>
                <EmptyMedia contained>
                  <SmFavoriteLineIcon className="size-6" />
                </EmptyMedia>
                <EmptyTitle>Nenhum favorito</EmptyTitle>
                <EmptyDescription>
                  Marque ativos como favoritos para acessá-los rapidamente.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveFilter("all")}
                className={`h-8 rounded-full px-3 text-xs font-medium transition-colors ${
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
                  onClick={() => setActiveFilter(type)}
                  className={`h-8 rounded-full px-3 text-xs font-medium transition-colors ${
                    activeFilter === type
                      ? "bg-foreground text-background"
                      : "bg-accent text-foreground hover:bg-accent/80"
                  }`}
                >
                  {typeLabels[type]}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {/* Grid */}
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
          </div>
        )}
      </div>

      {/* Native viewers */}
      {imageViewer && (
        <ImageLightbox asset={imageViewer} onClose={() => setImageViewer(null)} />
      )}
      {logoViewer && (
        <LogoModal asset={logoViewer} onClose={() => setLogoViewer(null)} />
      )}
      {colorViewer && (
        <ColorDetail color={colorViewer} onClose={() => setColorViewer(null)} />
      )}
      {videoViewer && (
        <VideoLightbox
          footage={videoViewer}
          onClose={() => setVideoViewer(null)}
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
