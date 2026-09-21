"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { notify } from "@/lib/notifications/toast";
import { normalizeText } from "@/lib/normalize-text";
import { useUrlState } from "@/lib/use-url-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useSlashFocus } from "@/lib/use-slash-focus";

/**
 * Curated subset of Phosphor icons that covers the Overlens UI surface.
 * The full catalog (1500+ icons, 6 weights) lives at https://phosphoricons.com.
 *
 * Names are resolved by string lookup against the Phosphor namespace, so a name
 * that ever stops existing is silently skipped instead of breaking the build.
 */
const CURATED_NAMES = [
  // Navegação & layout
  "House", "HouseSimple", "SquaresFour", "GridFour", "List", "ListBullets",
  "Sidebar", "Kanban", "Compass", "MapPin", "Path", "FlowArrow",
  // Ações
  "Plus", "PlusCircle", "Minus", "X", "Check", "CheckCircle", "PencilSimple",
  "Trash", "Copy", "ClipboardText", "DownloadSimple", "UploadSimple",
  "Share", "ShareNetwork", "PaperPlaneTilt", "ArrowsClockwise", "ArrowClockwise",
  // Setas & carets
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "ArrowUpRight",
  "CaretLeft", "CaretRight", "CaretUp", "CaretDown", "CaretDoubleRight",
  // Conteúdo & arquivos
  "File", "FileText", "FilePdf", "Folder", "FolderOpen", "FolderSimple",
  "Image", "Images", "Bookmark", "BookmarkSimple", "Tag", "Archive",
  "Books", "BookOpen", "Note", "Article",
  // Comunicação
  "Chat", "ChatCircle", "ChatCircleDots", "Envelope", "EnvelopeSimple",
  "Bell", "BellRinging", "Megaphone", "Phone",
  // Usuário & social
  "User", "UserCircle", "Users", "UsersThree", "Crown", "CrownSimple",
  "Heart", "Star", "ThumbsUp", "Handshake",
  // Mídia
  "Play", "Pause", "Stop", "SkipForward", "SkipBack", "Microphone",
  "MicrophoneSlash", "SpeakerHigh", "SpeakerSimpleX", "Camera", "VideoCamera",
  "MusicNotes", "Waveform", "Headphones",
  // Sistema & estados
  "Gear", "GearSix", "Sliders", "SlidersHorizontal", "Faders", "Funnel",
  "MagnifyingGlass", "Eye", "EyeSlash", "Lock", "LockOpen", "ShieldCheck",
  "Info", "Warning", "WarningCircle", "Question", "Prohibit", "Clock",
  "Calendar", "CalendarBlank", "Bug", "DotsThree", "DotsThreeVertical",
  "DotsThreeOutline", "SignOut", "Globe", "Translate",
  // Comércio
  "ShoppingBag", "ShoppingBagOpen", "Storefront", "Receipt", "CreditCard",
  // Conhecimento & criação (universo Overlens)
  "Sparkle", "MagicWand", "Atom", "Brain", "Lightbulb", "Lightning",
  "GraduationCap", "Palette", "GitFork", "GitBranch", "Tree", "Plant",
  "Fire", "Infinity", "Cube", "ChartLine", "ChartBar", "Code",
] as const;

type IconEntry = { name: string; Comp: Icon };

const ICON_NAMESPACE = PhosphorIcons as unknown as Record<string, Icon | undefined>;

const CURATED_ICONS: IconEntry[] = CURATED_NAMES.reduce<IconEntry[]>((acc, name) => {
  const Comp = ICON_NAMESPACE[name];
  if (Comp) acc.push({ name, Comp });
  return acc;
}, []);

const WEIGHTS: IconWeight[] = ["thin", "light", "regular", "bold", "fill", "duotone"];

function UsagePopover({ entry, weight }: { entry: IconEntry; weight: IconWeight }) {
  const Icon = entry.Comp;
  const snippet = `import { ${entry.name} } from "@phosphor-icons/react";\n\n<${entry.name}${weight === "regular" ? "" : ` weight="${weight}"`} />`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      notify.success("Copiado");
    } catch (err) {
      notify.fromError(err, "Não foi possível copiar");
    }
  }, [snippet]);

  return (
    <PopoverContent className="w-72 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Icon weight={weight} className="size-6 text-foreground" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium">{entry.name}</p>
          <p className="text-xs text-muted-foreground">weight: {weight}</p>
        </div>
      </div>
      <pre className="overflow-x-auto rounded-md bg-accent/50 px-2.5 py-2 text-caption leading-relaxed text-muted-foreground">
        <code>{snippet}</code>
      </pre>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        className="w-full"
        aria-label={`Copiar snippet de ${entry.name}`}
      >
        Copiar snippet
      </Button>
    </PopoverContent>
  );
}

function IconCard({ entry, weight }: { entry: IconEntry; weight: IconWeight }) {
  const Icon = entry.Comp;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-3 transition-colors hover:border-foreground/10 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <Icon weight={weight} className="size-7 text-foreground transition-transform motion-safe:group-hover:scale-110" aria-hidden="true" />
          <span className="max-w-full truncate text-xs leading-tight text-muted-foreground">
            {entry.name}
          </span>
        </button>
      </PopoverTrigger>
      <UsagePopover entry={entry} weight={weight} />
    </Popover>
  );
}

function isWeight(v: string): v is IconWeight {
  return (WEIGHTS as readonly string[]).includes(v);
}

type GalleryState = {
  weight: IconWeight;
  setWeight: (w: IconWeight) => void;
  search: string;
  setSearch: (v: string) => void;
};

function PhosphorGalleryView({ weight, setWeight, search, setSearch }: GalleryState) {
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const filtered = useMemo(() => {
    // Busca insensível a acento (os nomes são ASCII, o termo digitado nem sempre).
    const q = normalizeText(search);
    if (!q) return CURATED_ICONS;
    return CURATED_ICONS.filter((entry) => normalizeText(entry.name).includes(q));
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-56">
          <input
            ref={searchRef}
            type="search"
            placeholder="Buscar ícones…"
            aria-label="Buscar ícones"
            aria-keyshortcuts="/"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-field border-2 border-foreground/15 bg-transparent pl-3 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/70"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border/60 bg-surface-900 px-1.5 font-mono text-caption text-muted-foreground sm:block"
          >
            /
          </kbd>
        </div>

        <div className="flex flex-wrap gap-1" role="group" aria-label="Peso do ícone">
          {WEIGHTS.map((w) => (
            <Button
              key={w}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setWeight(w)}
              aria-pressed={weight === w}
              className={`rounded-full capitalize ${
                weight === w ? "bg-foreground text-background hover:bg-foreground/90" : ""
              }`}
            >
              {w}
            </Button>
          ))}
        </div>

        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} de {CURATED_ICONS.length} · catálogo completo em phosphoricons.com
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1">
        {filtered.map((entry) => (
          <IconCard key={entry.name} entry={entry} weight={weight} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          variant="filtered"
          title="Nenhum ícone encontrado"
          description="Nenhum resultado nesta seleção. Veja o catálogo completo em phosphoricons.com."
          onClear={() => setSearch("")}
          className="border-none py-12"
        />
      )}
    </div>
  );
}

/** Peso e busca persistidos na query string (`?weight=&q=`). */
function UrlPhosphorGallery() {
  const [weightRaw, setWeightRaw] = useUrlState<string>("weight", "regular");
  const [q, setQ] = useUrlState<string>("q", "");

  // Input local (digitação fluida) → debounce 250ms → URL.
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }
  const debouncedSearch = useDebouncedValue(search, 250);
  useEffect(() => {
    if (search !== debouncedSearch) return; // ainda digitando
    if (debouncedSearch !== q) setQ(debouncedSearch);
  }, [search, debouncedSearch, q, setQ]);

  return (
    <PhosphorGalleryView
      weight={isWeight(weightRaw) ? weightRaw : "regular"}
      setWeight={setWeightRaw}
      search={search}
      setSearch={setSearch}
    />
  );
}

/** Estado local (uso fora de uma rota com `<Suspense>`, como no Storybook). */
function LocalPhosphorGallery() {
  const [weight, setWeight] = useState<IconWeight>("regular");
  const [search, setSearch] = useState("");
  return (
    <PhosphorGalleryView
      weight={weight}
      setWeight={setWeight}
      search={search}
      setSearch={setSearch}
    />
  );
}

/**
 * `syncUrl` persiste peso e busca na URL (exige `<Suspense>` acima, por causa
 * do `useSearchParams`). Sem ele o estado é local — é assim que o Storybook,
 * hoje o único consumidor, monta a galeria sem mexer na URL do iframe.
 */
function PhosphorGallery({ syncUrl = false }: { syncUrl?: boolean } = {}) {
  return syncUrl ? <UrlPhosphorGallery /> : <LocalPhosphorGallery />;
}

function WeightsShowcase() {
  const Icon = ICON_NAMESPACE.Sparkle ?? CURATED_ICONS[0]?.Comp;
  if (!Icon) return null;
  return (
    <div className="flex flex-wrap gap-6">
      {WEIGHTS.map((w) => (
        <div key={w} className="flex flex-col items-center gap-2">
          <Icon weight={w} className="size-10 text-foreground" />
          <span className="text-xs capitalize text-muted-foreground">{w}</span>
        </div>
      ))}
    </div>
  );
}

function SizesShowcase() {
  const Icon = ICON_NAMESPACE.Compass ?? CURATED_ICONS[0]?.Comp;
  if (!Icon) return null;
  const sizes = [16, 20, 24, 32, 48];
  return (
    <div className="flex flex-wrap items-end gap-6">
      {sizes.map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Icon size={s} className="text-foreground" />
          <span className="text-xs text-muted-foreground">{s}px</span>
        </div>
      ))}
    </div>
  );
}

export { PhosphorGallery, WeightsShowcase, SizesShowcase, CURATED_ICONS };
