"use client";

import { useMemo, useState, useCallback } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const [copied, setCopied] = useState(false);

  const snippet = `import { ${entry.name} } from "@phosphor-icons/react";\n\n<${entry.name}${weight === "regular" ? "" : ` weight="${weight}"`} />`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
      <pre className="overflow-x-auto rounded-md bg-accent/50 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <code>{snippet}</code>
      </pre>
      <Button variant="secondary" size="sm" onClick={handleCopy} className="w-full">
        {copied ? "Copiado!" : "Copiar snippet"}
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
          <Icon weight={weight} className="size-7 text-foreground transition-transform group-hover:scale-110" />
          <span className="max-w-full truncate text-[10px] leading-tight text-muted-foreground">
            {entry.name}
          </span>
        </button>
      </PopoverTrigger>
      <UsagePopover entry={entry} weight={weight} />
    </Popover>
  );
}

function PhosphorGallery() {
  const [weight, setWeight] = useState<IconWeight>("regular");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CURATED_ICONS;
    return CURATED_ICONS.filter((entry) => entry.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Buscar ícones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-56 rounded-md border border-foreground/15 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        />

        <div className="flex flex-wrap gap-1">
          {WEIGHTS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeight(w)}
              className={`h-8 rounded-full px-3 text-xs font-medium capitalize transition-colors ${
                weight === w
                  ? "bg-foreground text-background"
                  : "bg-accent text-foreground hover:bg-accent/80"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} de {CURATED_ICONS.length} · catálogo completo em phosphoricons.com
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1">
        {filtered.map((entry) => (
          <IconCard key={entry.name} entry={entry} weight={weight} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum ícone encontrado nesta seleção. Veja o catálogo completo em phosphoricons.com.
        </p>
      )}
    </div>
  );
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
