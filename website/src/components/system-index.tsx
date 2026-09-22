"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notifications/toast";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { SmDocLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { DocSection } from "@/lib/docs";
import {
  BookMarked,
  Scan,
  LayoutGrid,
  Fingerprint,
  PenLine,
  Eye,
  Waves,
  BookOpen,
  Users,
  Package,
  ChartLine,
  ShoppingBag,
  Clapperboard,
  Bot,
  Radio,
  Library,
  Film,
  Music,
  Sparkles,
  FlaskConical,
  Search,
  Frame,
  Wrench,
  BrushIcon,
  Video,
  Gauge,
  Handshake,
  UserCheck,
  Route,
  ScrollText,
  Mail,
  Globe,
  Settings,
  ClipboardList,
  FileCheck,
  BadgeDollarSign,
  Briefcase,
  Compass,
  History,
  Layers,
  Blocks,
  Boxes,
  HeartHandshake,
  CalendarDays,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { PromptArea } from "@/components/prompt-area";
import { TypewriterHeading } from "@/components/typewriter-heading";
import { flattenForCitation } from "@/lib/citable-sections";

export type { CitableSection } from "@/lib/citable-sections";

function countFilesDeep(s: DocSection): number {
  return s.files.length + s.children.reduce((sum, c) => sum + countFilesDeep(c), 0);
}

function findFirstFile(s: DocSection): DocSection["files"][0] | undefined {
  if (s.files.length > 0) return s.files[0];
  for (const child of s.children) {
    const found = findFirstFile(child);
    if (found) return found;
  }
  return undefined;
}

interface SectionMeta {
  icon: LucideIcon;
}

/* ─── Brand System ─── */
const brandSections: Record<string, SectionMeta> = {
  definição: {
    icon: BookMarked,
  },
  "overview da overlens": {
    icon: Scan,
  },
  "plataforma da marca": {
    icon: LayoutGrid,
  },
  "núcleo da marca": {
    icon: Fingerprint,
  },
  "universo verbal": {
    icon: PenLine,
  },
  "universo visual": {
    icon: Eye,
  },
  "universo sonoro": {
    icon: Waves,
  },
};

/* ─── Growth System ─── */
const growthSections: Record<string, SectionMeta> = {
  introdução: {
    icon: BookOpen,
  },
  "mercado e público": {
    icon: Users,
  },
  ofertas: {
    icon: Package,
  },
  estratégia: {
    icon: ChartLine,
  },
  produtos: {
    icon: ShoppingBag,
  },
};

/* ─── Content System (Estúdio Criativo) ─── */
const contentSections: Record<string, SectionMeta> = {
  "estúdio criativo": {
    icon: Clapperboard,
  },
  conteúdo: {
    icon: PenLine,
  },
  "personas sintéticas": {
    icon: Bot,
  },
  touchpoints: {
    icon: Radio,
  },
};

/* ─── Pacote Cultural ─── */
const pacoteSections: Record<string, SectionMeta> = {
  "pacote cultural": {
    icon: Library,
  },
  livros: {
    icon: BookOpen,
  },
  filmes: {
    icon: Film,
  },
  músicas: {
    icon: Music,
  },
  encerramento: {
    icon: Sparkles,
  },
};

/* ─── Playbook de Conteúdo ─── */
const playbookConteudoSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
  },
  "pesquisa": {
    icon: Search,
  },
  enquadramento: {
    icon: Frame,
  },
  ferramentas: {
    icon: Wrench,
  },
  criativos: {
    icon: BrushIcon,
  },
};

/* ─── Playbook de Edição de Vídeos ─── */
const playbookVideosSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
  },
  produção: {
    icon: Video,
  },
  métricas: {
    icon: Gauge,
  },
};

/* ─── Playbook de Operação ─── */
const playbookOperacaoSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
  },
  comercial: {
    icon: Handshake,
  },
  papéis: {
    icon: UserCheck,
  },
  "sales": {
    icon: BadgeDollarSign,
  },
  roteiros: {
    icon: ScrollText,
  },
  "fluxos": {
    icon: Route,
  },
  outbound: {
    icon: Mail,
  },
  operacional: {
    icon: Settings,
  },
};

/* ─── Playbook de Gestão ─── */
const playbookGestaoSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
  },
  operação: {
    icon: Settings,
  },
  contratação: {
    icon: UserCheck,
  },
  sla: {
    icon: ClipboardList,
  },
  roteiros: {
    icon: ScrollText,
  },
  documentos: {
    icon: FileCheck,
  },
};

/* ─── Business Doc ─── */
const businessSections: Record<string, SectionMeta> = {
  overview: {
    icon: Scan,
  },
  modelos: {
    icon: LayoutGrid,
  },
  arquitetura: {
    icon: Briefcase,
  },
  "histórico": {
    icon: History,
  },
  "direção": {
    icon: Compass,
  },
};

/* ─── Product System ─── */
const productSections: Record<string, SectionMeta> = {
  sistema: {
    icon: Blocks,
  },
  plataforma: {
    icon: Layers,
  },
  roadmap: {
    icon: Route,
  },
};

/* ─── Community System ─── */
const communitySections: Record<string, SectionMeta> = {
  funcionamento: {
    icon: Boxes,
  },
  rituais: {
    icon: CalendarDays,
  },
  "governança": {
    icon: Shield,
  },
  comunidade: {
    icon: HeartHandshake,
  },
};

/* ─── Unified lookup ─── */
const allSections: Record<string, SectionMeta> = {
  ...brandSections,
  ...growthSections,
  ...contentSections,
  ...pacoteSections,
  ...playbookConteudoSections,
  ...playbookVideosSections,
  ...playbookOperacaoSections,
  ...playbookGestaoSections,
  ...businessSections,
  ...productSections,
  ...communitySections,
};

const fallbackIcons: LucideIcon[] = [
  Globe, BookOpen, Sparkles, Package, ChartLine, Users, Wrench, Radio,
];

/** Ícone da seção, pelo título; cai nos genéricos quando não há mapeamento. */
function getSectionMeta(title: string, index: number): SectionMeta {
  const key = title.toLowerCase();
  for (const [match, meta] of Object.entries(allSections)) {
    if (key.includes(match)) return meta;
  }
  return { icon: fallbackIcons[index % fallbackIcons.length] };
}

function SectionRow({
  section,
  basePath,
  index,
}: {
  section: DocSection;
  basePath: string;
  index: number;
}) {
  const fileCount = countFilesDeep(section);
  const firstFile = findFirstFile(section);
  const href = firstFile
    ? basePath + "/" + firstFile.segments.join("/")
    : undefined;

  // For pacote cultural, count H2 entries (indicações) instead of pages
  const entryCount =
    basePath === "/pacote"
      ? section.files.reduce((sum, f) => {
          // Count H2 + H3 entry headers minus the first H2 (evocative subtitle)
          const h2s = (f.content.match(/^## /gm) || []).length;
          const h3s = (f.content.match(/^### /gm) || []).length;
          return sum + Math.max(0, h2s - 1) + h3s;
        }, 0)
      : 0;
  const usePacoteCount = basePath === "/pacote" && entryCount > 0;

  const { icon: Icon } = getSectionMeta(section.title, index);

  const count = usePacoteCount
    ? `${entryCount} ${entryCount === 1 ? "indicação" : "indicações"}`
    : `${fileCount} ${fileCount === 1 ? "página" : "páginas"}`;

  const content = (
    <>
      <Icon className="size-4 shrink-0 opacity-60" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
        {section.title}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {count}
        {section.children.length > 0 && (
          <>
            {" · "}
            {section.children.length}{" "}
            {section.children.length === 1 ? "subseção" : "subseções"}
          </>
        )}
      </span>
    </>
  );

  const rowClasses = "flex items-center gap-3 py-3";

  return (
    <li className="border-b border-border/60">
      {href ? (
        <Link
          href={href}
          aria-label={`Abrir seção ${section.title}`}
          className={cn(
            rowClasses,
            "rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground",
            "[&>svg]:transition-opacity hover:[&>svg]:opacity-100",
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={rowClasses}>{content}</div>
      )}
    </li>
  );
}

export function SystemIndex({
  title,
  heading,
  questions,
  description,
  sections,
  basePath,
}: {
  title: string;
  /** Título da página para leitores de tela. Sem ele, o nome do system. */
  heading?: string;
  /** Frases que o h1 digita em ciclo, em ordem sorteada. */
  questions?: string[];
  description: string;
  sections: DocSection[];
  basePath: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit({
    text,
    planMode,
    selectedSection,
  }: {
    text: string;
    planMode: boolean;
    selectedSection: { title: string; segments: string[] } | null;
  }) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstMessage: text,
          planMode,
          citedSection: selectedSection,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Não foi possível iniciar a conversa.");
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/chat/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      notify.error(message);
      setSubmitting(false);
    }
    // NÃO setSubmitting(false) no caminho de sucesso — a navegação cuida.
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-16 pb-16 md:pt-24">
      {/* Mesma abertura da nova conversa (`ChatWelcome`): título e apoio
          centrados, composer logo abaixo. Só o conteúdo muda por sistema. */}
      <div className="flex flex-col items-center gap-6 text-center">
        <TypewriterHeading
          anchor={heading ?? title}
          phrases={questions ?? []}
          className="flex min-h-[1.15em] items-center justify-center text-h2 md:text-display font-light text-balance text-foreground"
        />
        <p className="text-base text-pretty text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-9">
        <PromptArea
          citableSections={flattenForCitation(sections)}
          basePath={basePath}
          onSubmit={handleSubmit}
          loading={submitting}
          focusShortcut={false}
        />
      </div>

      <ul className="mt-10 border-t border-border/60">
        {sections.map((section, i) => (
          <SectionRow key={section.slug} section={section} basePath={basePath} index={i} />
        ))}
      </ul>

      {sections.length === 0 && (
        <EmptyState
          icon={<SmDocLineIcon className="size-10" />}
          title="Nenhuma seção encontrada"
          description="Este system ainda não tem páginas publicadas. Você pode explorar outro system enquanto isso."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/">Ver todos os systems</Link>
            </Button>
          }
          className="py-20"
        />
      )}
    </div>
  );
}
