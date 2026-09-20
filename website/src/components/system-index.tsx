"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notifications/toast";
import { HeadingTitle } from "@/components/ui/heading";
import { EmptyState } from "@/components/empty-state";
import { SmDocLineIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { DocSection } from "@/lib/docs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { flattenForCitation } from "@/lib/citable-sections";
import { getGradient } from "@/lib/brand-gradients";

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

/**
 * Ícone + gradiente de marca por seção. O gradiente é determinístico pela
 * chave da seção (`getGradient`), então a mesma seção tem sempre a mesma cor.
 */
function getSectionMeta(title: string, index: number): SectionMeta & { gradient: string } {
  const key = title.toLowerCase();
  for (const [match, meta] of Object.entries(allSections)) {
    if (key.includes(match)) return { ...meta, gradient: getGradient(match) };
  }
  return {
    icon: fallbackIcons[index % fallbackIcons.length],
    gradient: getGradient(key || index),
  };
}

function SectionCard({
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

  const { icon: Icon, gradient } = getSectionMeta(section.title, index);

  const content = (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-black"
          style={{
            background: gradient,
            backgroundSize: "300% 300%",
            animation: "icon-gradient 6s ease infinite",
          }}
        >
          <Icon className="size-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle size="sm" className="truncate text-balance">
            {section.title}
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-pretty">
            {usePacoteCount
              ? `${entryCount} ${entryCount === 1 ? "indicação" : "indicações"}`
              : `${fileCount} ${fileCount === 1 ? "página" : "páginas"}`}
            {section.children.length > 0 && (
              <span>
                {" · "}
                {section.children.length}{" "}
                {section.children.length === 1 ? "subseção" : "subseções"}
              </span>
            )}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );

  return (
    <Card className="group transition-all duration-200 hover:border-muted-foreground/30 hover:bg-accent/50 hover:-translate-y-0.5 hover:shadow-md">
      {href ? (
        <Link
          href={href}
          aria-label={`Abrir seção ${section.title}`}
          className="block rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </Card>
  );
}

export function SystemIndex({
  title,
  description,
  sections,
  basePath,
}: {
  title: string;
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
    <div className="mx-auto max-w-4xl px-4 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      <div className="mb-8 px-2">
        <HeadingTitle as="h1" size="xl" className="font-normal tracking-normal leading-none text-balance">
          {title}
        </HeadingTitle>
        <p className="mt-5 text-sm leading-7 text-pretty text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mb-8 px-2">
        <PromptArea
          citableSections={flattenForCitation(sections)}
          basePath={basePath}
          onSubmit={handleSubmit}
          loading={submitting}
          focusShortcut={false}
        />
      </div>

      <div className="grid gap-3 px-2 sm:grid-cols-2">
        {sections.map((section, i) => (
          <SectionCard key={section.slug} section={section} basePath={basePath} index={i} />
        ))}
      </div>

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
