"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SmCloseLineIcon, SmVisibilitySolidIcon, SmVisibilityOffSolidIcon } from "@/components/icons";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { getAssetPreviewUrl, getStoragePath } from "@/lib/supabase/storage";
import { useAuth, canDelete } from "@/lib/auth";
import { useHiddenAssets } from "@/lib/hidden-assets";
import { useInfiniteScroll } from "@/lib/use-infinite-scroll";
import { useAssetMetadata, type AssetMetadataOverride } from "@/lib/asset-metadata";
import { AssetEditDialog } from "@/components/asset-edit-dialog";

// ─── Data ────────────────────────────────────────────────────

export interface ImageAsset {
  filename: string;
  title: string;
  caption: string;
  author: string;
  year: string;
  tags: string[];
  sourceUrl: string;
  /** Bucket where the asset lives. When equal to "platform-assets", the
   * gallery routes the preview URL through /api/assets/preview, which serves
   * a cached preview (or falls back to the original) instead of hitting the
   * public asset-previews bucket directly. */
  bucketSource?: "asset-previews" | "platform-assets";
}

/** Hardcoded metadata for known images — used to enrich storage listing */
const IMAGE_METADATA: Record<string, Omit<ImageAsset, "filename">> = {
  "Athens school.png": { title: "The School of Athens", caption: "Platão aponta para o céu das ideias; Aristóteles aponta para o chão da experiência. Raphael reuniu numa única sala todos os pensadores que a civilização ocidental produziu: matemáticos, filósofos, astrônomos, geômetras. Não como hierarquia, mas como convivência. A premissa visual do nexialismo está aqui: o conhecimento só atinge seu potencial quando as disciplinas se encontram no mesmo espaço e dialogam sem pedir licença.", author: "Raphael", year: "1511", tags: ["pintura", "clássico"], sourceUrl: "https://en.wikipedia.org/wiki/The_School_of_Athens" },
  "Clairvoyance.png": { title: "Clairvoyance", caption: "Magritte pinta a si mesmo olhando para um ovo e pintando um pássaro. O artista não reproduz o que vê; ele enxerga o que ainda não existe e o torna visível. Essa é a operação fundamental da criação: perceber o potencial antes da forma, ver o voo antes da eclosão. Para a Overlens, Clairvoyance é a definição visual do que significa trocar de lente.", author: "René Magritte", year: "1936", tags: ["pintura", "surrealismo"], sourceUrl: "https://en.wikipedia.org/wiki/Clairvoyance_(Magritte)" },
  "Fountain.png": { title: "Fountain", caption: "Em 1917, Duchamp assinou um urinol com pseudônimo e o enviou para uma exposição de arte. O objeto não mudou; o contexto mudou tudo. Fountain é a demonstração mais radical de que a criação não está no material, mas na decisão de quem olha. Contexto como matéria prima, intenção como gesto fundador. A arte conceitual nasce aqui: o pensamento precede o objeto.", author: "Marcel Duchamp", year: "1917", tags: ["arte-conceitual", "modernismo"], sourceUrl: "https://pt.wikipedia.org/wiki/Fonte_(Duchamp)" },
  "Hercules assisting Atlas.png": { title: "Hercules Assisting Atlas", caption: "Atlas carrega o peso do céu sobre os ombros; Hércules se oferece para segurar enquanto Atlas busca as maçãs douradas. A gravura captura o momento exato da colaboração: o peso do mundo não se sustenta sozinho. Para a Overlens, essa imagem lembra que autonomia intelectual não significa isolamento; os projetos mais ambiciosos exigem que alguém aceite dividir o peso.", author: "Claude Mellan", year: "séc. XVII", tags: ["pintura", "clássico"], sourceUrl: "https://commons.wikimedia.org/wiki/File:Hercules_Assisting_Atlas_MET_DP822474.jpg" },
  "Prometheus brings fire to mankind.png": { title: "Prometheus Brings Fire to Mankind", caption: "Prometeu rouba o fogo dos deuses e o entrega aos humanos, sabendo que será punido por isso. O fogo não é apenas calor: é tecnologia, linguagem, consciência, poder de transformar o mundo. Esse é o arquétipo fundador da Overlens e o espírito que batiza o proxy Prometheus: a faísca tecnológica como ato de rebeldia criativa, a decisão de democratizar o poder de criar mesmo quando o sistema resiste.", author: "Heinrich Füger", year: "1817", tags: ["pintura", "clássico"], sourceUrl: "https://en.wikipedia.org/wiki/Prometheus" },
  "Relativity.png": { title: "Relativity", caption: "Três campos gravitacionais coexistem na mesma estrutura arquitetônica. Figuras sobem escadas que, vistas de outro ângulo, descem. Escher demonstra visualmente que a perspectiva determina a realidade: o que parece impossível de um ponto de vista é perfeitamente lógico de outro. Para o pensamento nexialista, Relativity é um lembrete de que sistemas complexos só se compreendem quando aceitos por múltiplas lentes simultâneas.", author: "M.C. Escher", year: "1953", tags: ["ilustração", "surrealismo"], sourceUrl: "https://en.wikipedia.org/wiki/Relativity_(M._C._Escher)" },
  "The Ancient of Days.png": { title: "The Ancient of Days", caption: "Uma figura divina se inclina para fora das nuvens e estende um compasso sobre o vazio. Blake ilustra o ato primordial de dar forma ao caos: medir, delimitar, organizar. Mas há ambiguidade na imagem; o gesto é ao mesmo tempo criação e restrição. Para a Overlens, essa tensão é central: o método traz clareza, mas a clareza sem imaginação produz apenas limites.", author: "William Blake", year: "1794", tags: ["pintura", "clássico"], sourceUrl: "https://en.wikipedia.org/wiki/The_Ancient_of_Days" },
  "The Attributes of the Arts and the Rewards Which Are.png": { title: "The Attributes of the Arts", caption: "Chardin dispõe sobre uma mesa os instrumentos de cada arte: paleta, cinzel, compasso, partitura, livros. Não há artista na cena; apenas as ferramentas, organizadas com a reverência de quem entende que o ofício precede o gênio. A criação nasce da disciplina, não do acaso. Para a Overlens, essa natureza morta é um manifesto silencioso: domine as ferramentas antes de esperar que elas produzam algo que valha a pena.", author: "Jean-Baptiste-Siméon Chardin", year: "1766", tags: ["pintura", "clássico"], sourceUrl: "https://en.wikipedia.org/wiki/Jean-Baptiste-Sim%C3%A9on_Chardin" },
  "The Human Condition.png": { title: "The Human Condition", caption: "Um cavalete diante de uma janela segura uma tela que reproduz exatamente a paisagem atrás dela. Onde termina a pintura e começa a realidade? Magritte nos força a confrontar algo que normalmente ignoramos: toda percepção é mediada, toda representação é uma camada sobre outra. Ver nunca é neutro. Para a Overlens, essa obra encapsula o princípio da lente: o que chamamos de realidade é sempre uma interpretação que escolhemos aceitar.", author: "René Magritte", year: "1933", tags: ["pintura", "surrealismo"], sourceUrl: "https://wikioo.org/pt/paintings.php?refarticle=5ZKELQ" },
  "The lion man.png": { title: "Löwenmensch", caption: "Esculpida em marfim de mamute há aproximadamente 40 mil anos, esta figura com corpo humano e cabeça de leão é a evidência mais antiga de imaginação simbólica da espécie humana. Alguém, numa caverna na Alemanha, olhou para o mundo e imaginou algo que não existia: uma fusão entre o humano e o animal. Esse é o gesto fundador da criação. Antes de qualquer tecnologia, antes de qualquer linguagem escrita, já existia a capacidade de ver além do que está dado.", author: "Anônimo", year: "~40.000 a.C.", tags: ["escultura", "ancestral"], sourceUrl: "https://en.wikipedia.org/wiki/Lion-man" },
  "The persistence of memory.png": { title: "The Persistence of Memory", caption: "Relógios derretem sobre paisagens desérticas como se o tempo fosse uma substância maleável. Dalí pintou essa obra após uma noite de insônia, observando queijo camembert amolecendo ao calor. O resultado é uma das imagens mais reconhecíveis da história da arte: a demonstração visual de que nossas categorias mais sólidas (tempo, espaço, permanência) são mais frágeis do que a razão gostaria de admitir. Para criadores, a lição é clara: questione as estruturas que parecem fixas.", author: "Salvador Dalí", year: "1931", tags: ["pintura", "surrealismo"], sourceUrl: "https://www.wikiart.org/pt/salvador-dali/a-persistencia-da-memoria-1931" },
  "The son of man.png": { title: "The Son of Man", caption: "Um homem de chapéu coco e sobretudo está de pé diante do mar. Uma maçã verde flutua exatamente na frente do seu rosto, ocultando sua identidade. Magritte disse sobre esta obra: \"tudo o que é visível esconde algo que também é visível\". O rosto existe, mas não podemos vê lo. A verdade está ali, mas algo sempre se interpõe. Para a Overlens, essa imagem é um lembrete permanente de que o óbvio frequentemente esconde o essencial.", author: "René Magritte", year: "1964", tags: ["pintura", "surrealismo"], sourceUrl: "https://en.wikipedia.org/wiki/The_Son_of_Man_(Magritte)" },
  "The Tower of Babel.png": { title: "The Tower of Babel", caption: "Bruegel pinta a torre com um realismo arquitetônico obsessivo: cada andar, cada andaime, cada trabalhador é visível. A ambição é monumental; a execução, impressionante. Mas a torre está inclinada, e os andares superiores já mostram sinais de colapso. A obra captura a tensão entre a grandeza do projeto e a fragilidade da execução sem consciência. Para a Overlens, Babel não é apenas uma advertência sobre arrogância; é sobre o que acontece quando se constrói sem linguagem comum.", author: "Pieter Bruegel", year: "1563", tags: ["pintura", "clássico"], sourceUrl: "https://en.wikipedia.org/wiki/Tower_of_Babel" },
  "The Treachery of Images.png": { title: "The Treachery of Images", caption: "\"Ceci n'est pas une pipe.\" Abaixo de uma representação meticulosa de um cachimbo, Magritte escreve que aquilo não é um cachimbo. Ele está certo: é uma pintura de um cachimbo. A distância entre o objeto e sua representação é o território onde toda comunicação opera. Para a Overlens, essa obra é fundacional: quem trabalha com design, linguagem e narrativa precisa entender que o mapa nunca é o território, e que toda representação carrega escolhas invisíveis.", author: "René Magritte", year: "1929", tags: ["pintura", "surrealismo"], sourceUrl: "https://en.wikipedia.org/wiki/The_Treachery_of_Images" },
  "The weight of thoughts.png": { title: "The Weight of Thoughts", caption: "Uma cabeça humana monumental, feita de letras e palavras comprimidas, repousa sobre o chão com o peso de uma rocha. Plensa materializa algo que normalmente tratamos como abstração: ideias têm massa. Pensamentos ocupam espaço, consomem energia, deformam a realidade ao redor. Para a Overlens, essa escultura valida uma convicção central: o trabalho intelectual e criativo não é leve nem decorativo. Pensar com profundidade exige esforço proporcional ao impacto que se busca gerar.", author: "Jaume Plensa", year: "2009", tags: ["escultura", "contemporâneo"], sourceUrl: "https://en.wikipedia.org/wiki/Jaume_Plensa" },
  "Wanderer above the Sea of Fog.png": { title: "Wanderer Above the Sea of Fog", caption: "Um homem de costas, apoiado numa rocha, contempla um horizonte coberto de névoa. Não sabemos o que ele vê além da bruma; ele também não sabe. Mas decidiu subir até ali. Friedrich pintou o ícone definitivo do Romantismo: o indivíduo diante do sublime, no limiar entre o conhecido e o desconhecido. Para a Overlens, essa é a postura do criador diante do futuro: não há garantia do que existe além, mas a decisão de olhar já é, em si, um ato de criação.", author: "Caspar David Friedrich", year: "1818", tags: ["pintura", "romantismo"], sourceUrl: "https://en.wikipedia.org/wiki/Wanderer_above_the_Sea_of_Fog" },
};

/** Build a display-friendly title from a filename */
function titleFromFilename(name: string): string {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return withoutExt.replace(/[-_]/g, " ");
}

/** Image extensions to include from storage listing */
const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "avif"]);

// Legacy export kept for consumers that import IMAGES directly
export const IMAGES: ImageAsset[] = Object.entries(IMAGE_METADATA).map(
  ([filename, meta]) => ({ filename, ...meta }),
);

// ─── Helpers ─────────────────────────────────────────────────

export function getAllImageTags(): string[] {
  const tagSet = new Set<string>();
  for (const meta of Object.values(IMAGE_METADATA)) {
    for (const tag of meta.tags) {
      tagSet.add(tag);
    }
  }
  tagSet.add("upload");
  return Array.from(tagSet).sort();
}

function imageSrc(asset: Pick<ImageAsset, "filename" | "bucketSource">) {
  if (asset.bucketSource === "platform-assets") {
    // No preview in the public bucket — let the preview API generate it on
    // demand (and fall back to the original if generation fails).
    return `/api/assets/preview?file=${encodeURIComponent(`Imagens/${asset.filename}`)}`;
  }
  return getAssetPreviewUrl("Imagens", asset.filename);
}

// ─── Image Card ─────────────────────────────────────────────

function ImageCard({
  asset,
  onClick,
  isFavorite,
  onToggleFavorite,
  showHideButton,
  isHidden,
  onToggleHide,
}: {
  asset: ImageAsset;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showHideButton?: boolean;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className="rounded-sm overflow-hidden cursor-pointer group relative w-full text-left aspect-[4/3]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc(asset)}
        alt={asset.title}
        className="w-full h-full object-cover block"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
        {showHideButton && onToggleHide && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleHide(); }}
            className="size-8 rounded-full flex items-center justify-center bg-black/50 text-white/40 hover:text-white/70 hover:bg-black/70 transition-all"
          >
            {isHidden ? <SmVisibilityOffSolidIcon className="size-4" /> : <SmVisibilitySolidIcon className="size-4" />}
          </button>
        )}
        <FavoriteButton isFavorite={isFavorite} onClick={() => onToggleFavorite()} />
      </div>
    </div>
  );
}

// ─── Lightbox ───────────────────────────────────────────────

export function ImageLightbox({
  asset,
  onClose,
  onDelete,
  onEdit,
  isHidden,
  onToggleHide,
}: {
  asset: ImageAsset;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isHidden?: boolean;
  onToggleHide?: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const [deleting, setDeleting] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgWidth, setImgWidth] = useState<number | undefined>(undefined);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageSrc(asset);
    a.download = asset.filename;
    a.click();
  };

  const handleImgLoad = () => {
    if (imgRef.current) {
      setImgWidth(imgRef.current.clientWidth);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este asset?")) return;
    setDeleting(true);
    try {
      const storagePath = getStoragePath("banco-de-imagens", asset.filename);
      const res = await fetch("/api/assets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath, previewPath: storagePath }),
      });
      if (res.ok) {
        onDelete?.();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch {
      alert("Erro ao excluir asset");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-start justify-between px-4 py-3 shrink-0 gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 min-w-0 max-w-xs">
          <p className="text-sm font-medium text-white/80 truncate">
            {asset.title}
          </p>
          {asset.author && (
            <p className="text-xs text-white/40 mt-0.5">
              {asset.author}{asset.year ? `, ${asset.year}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isAdmin && onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={onEdit}
            >
              <span>Editar</span>
            </Button>
          )}
          {isAdmin && onToggleHide && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
              onClick={async () => {
                setHiding(true);
                await onToggleHide();
                setHiding(false);
              }}
              disabled={hiding}
            >
              <span>{hiding ? "..." : isHidden ? "Desocultar" : "Ocultar"}</span>
            </Button>
          )}
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
          <Button variant="default" size="sm" onClick={handleDownload}>
            <span>Download</span>
          </Button>
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

      {/* Image + caption */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 pb-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageSrc(asset)}
          alt={asset.title}
          className="max-h-[80%] max-w-full object-contain rounded-sm"
          onLoad={handleImgLoad}
        />
        {asset.caption && (
          <div
            className="mt-3 flex items-start justify-between gap-4"
            style={{ width: imgWidth ? `${imgWidth}px` : "100%", maxWidth: "100%" }}
          >
            <div>
              <p className="text-xs text-white/50 leading-relaxed text-left">
                {asset.caption}
              </p>
              {asset.author && (
                <p className="text-[14px] text-white/30 mt-1 text-left">
                  {asset.author}{asset.year ? `, ${asset.year}` : ""}
                </p>
              )}
            </div>
            {asset.sourceUrl && (
              <Button variant="ghost" size="sm" asChild className="shrink-0 text-white/40 hover:text-white">
                <a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <span>Ver original</span>
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hook: fetch images from storage ─────────────────────────

function useStorageImages() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      // Ask for asset-previews as the primary source and platform-assets as a
      // fallback. The API merges entries from platform-assets that have no
      // corresponding preview, so orphaned originals (uploaded when Sharp
      // failed) still show up in the gallery.
      const res = await fetch(
        "/api/assets/list?folder=Imagens&bucket=asset-previews&fallbackBucket=platform-assets",
      );
      if (!res.ok) throw new Error("fetch failed");
      const { files } = (await res.json()) as {
        files: { name: string; id: string; createdAt: string; source?: string }[];
      };

      // Build image list from storage files
      const result: ImageAsset[] = [];
      const seen = new Set<string>();

      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!IMAGE_EXTS.has(ext)) continue;

        // Check if we already have a base-name match (avoid showing both .png original and .webp preview)
        const baseName = file.name.replace(/\.[^.]+$/, "");
        if (seen.has(baseName)) continue;
        seen.add(baseName);

        const bucketSource: ImageAsset["bucketSource"] =
          file.source === "platform-assets" ? "platform-assets" : "asset-previews";

        const meta = IMAGE_METADATA[file.name];
        if (meta) {
          result.push({ filename: file.name, ...meta, bucketSource });
        } else {
          // Uploaded image without hardcoded metadata
          result.push({
            filename: file.name,
            title: titleFromFilename(file.name),
            caption: "",
            author: "",
            year: "",
            tags: ["upload"],
            sourceUrl: "",
            bucketSource,
          });
        }
      }

      setImages(result);
    } catch {
      // Fallback to hardcoded images if fetch fails
      setImages(
        Object.entries(IMAGE_METADATA).map(([filename, meta]) => ({ filename, ...meta })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  return { images, loading, refresh: fetchImages };
}

// ─── Main Component ──────────────────────────────────────────

/** Apply admin override fields on top of the static asset entry. */
function applyOverride(base: ImageAsset, override: AssetMetadataOverride | undefined): ImageAsset {
  if (!override) return base;
  return {
    ...base,
    title: override.title ?? base.title,
    caption: override.caption ?? base.caption,
    author: override.author ?? base.author,
    year: override.year ?? base.year,
    sourceUrl: override.source_url ?? base.sourceUrl,
    tags: override.tags.length > 0 ? override.tags : base.tags,
  };
}

export function ImageBank({
  showHidden = false,
  onCountChange,
}: {
  showHidden?: boolean;
  onCountChange?: (visible: number, hidden: number) => void;
} = {}) {
  const { user } = useAuth();
  const isAdmin = user && canDelete(user.role);
  const { images, loading, refresh } = useStorageImages();
  const { isHidden, hide, unhide } = useHiddenAssets("image");
  const metadata = useAssetMetadata("image");
  const [selected, setSelected] = useState<ImageAsset | null>(null);
  const [editing, setEditing] = useState<ImageAsset | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const mergedImages = images.map((img) => applyOverride(img, metadata.get(img.filename)));

  const hiddenImages = mergedImages.filter((img) => isHidden(img.filename));
  const nonHiddenImages = mergedImages.filter((img) => !isHidden(img.filename));
  const visibleImages = showHidden ? hiddenImages : nonHiddenImages;

  useEffect(() => {
    onCountChange?.(nonHiddenImages.length, hiddenImages.length);
  }, [nonHiddenImages.length, hiddenImages.length, onCountChange]);

  const { visibleItems: pagedImages, hasMore, setSentinel } = useInfiniteScroll(visibleImages);

  const handleDeleted = () => {
    setSelected(null);
    refresh();
  };

  const handleToggleHide = async (filename: string) => {
    if (isHidden(filename)) {
      await unhide(filename);
    } else {
      await hide(filename);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-white/40">Carregando imagens...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {pagedImages.map((asset) => (
          <ImageCard
            key={asset.filename}
            asset={asset}
            onClick={() => setSelected(asset)}
            isFavorite={isFavorite(asset.filename)}
            onToggleFavorite={() => toggleFavorite({ id: asset.filename, type: "image", title: asset.title, subtitle: `${asset.author}${asset.year ? `, ${asset.year}` : ""}`, thumbnail: imageSrc(asset) })}
            showHideButton={!!isAdmin}
            isHidden={isHidden(asset.filename)}
            onToggleHide={() => handleToggleHide(asset.filename)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={setSentinel} className="flex items-center justify-center py-8">
          <p className="text-xs text-white/30">Carregando mais...</p>
        </div>
      )}

      {visibleImages.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-white/40">
            {showHidden ? "Nenhum asset oculto" : "Nenhuma imagem encontrada"}
          </p>
        </div>
      )}

      {selected && (
        <ImageLightbox
          asset={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDeleted}
          onEdit={isAdmin ? () => setEditing(selected) : undefined}
          isHidden={isHidden(selected.filename)}
          onToggleHide={() => handleToggleHide(selected.filename)}
        />
      )}

      {editing && (
        <AssetEditDialog
          open={!!editing}
          onOpenChange={(open) => { if (!open) setEditing(null); }}
          config={{
            assetType: "image",
            folder: "Imagens",
            allowRename: true,
          }}
          assetKey={editing.filename}
          initial={{
            title: editing.title ?? "",
            caption: editing.caption ?? "",
            author: editing.author ?? "",
            year: editing.year ?? "",
            sourceUrl: editing.sourceUrl ?? "",
            tags: editing.tags ?? [],
            filename: editing.filename,
          }}
          onSaved={({ renamedTo }) => {
            setEditing(null);
            if (renamedTo) {
              // Filename changed — refetch storage listing so the new key shows up.
              refresh();
              setSelected(null);
            } else if (selected && selected.filename === editing.filename) {
              // Keep the lightbox open with the freshly merged values.
              setSelected({ ...selected, ...applyOverride(selected, metadata.get(editing.filename)) });
            }
          }}
        />
      )}
    </div>
  );
}
