"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DocSection } from "@/lib/docs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FileText,
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
  type LucideIcon,
} from "lucide-react";
import { PromptArea } from "@/components/prompt-area";

function countFilesDeep(s: DocSection): number {
  return s.files.length + s.children.reduce((sum, c) => sum + countFilesDeep(c), 0);
}

export type CitableSection = {
  title: string;
  segments: string[];
  groupTitle: string;
};

function flattenForCitation(sections: DocSection[]): CitableSection[] {
  const result: CitableSection[] = [];
  for (const top of sections) {
    walk(top, top.title);
  }
  function walk(s: DocSection, groupTitle: string) {
    for (const file of s.files) {
      result.push({ title: file.title, segments: file.segments, groupTitle });
    }
    for (const child of s.children) {
      walk(child, groupTitle);
    }
  }
  return result;
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
  gradient: string;
}

/* ─── Brand System ─── */
const brandSections: Record<string, SectionMeta> = {
  definição: {
    icon: BookMarked,
    gradient: "linear-gradient(135deg, #77C5D5 0%, #A8DDE8 50%, #77C5D5 100%)",
  },
  "overview da overlens": {
    icon: Scan,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
  "plataforma da marca": {
    icon: LayoutGrid,
    gradient: "linear-gradient(135deg, #F87C56 0%, #FBA98A 50%, #F87C56 100%)",
  },
  "núcleo da marca": {
    icon: Fingerprint,
    gradient: "linear-gradient(135deg, #F4C3CC 0%, #F9DDE3 50%, #F4C3CC 100%)",
  },
  "universo verbal": {
    icon: PenLine,
    gradient: "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #3A913F 100%)",
  },
  "universo visual": {
    icon: Eye,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
  "universo sonoro": {
    icon: Waves,
    gradient: "linear-gradient(135deg, #4A8CB5 0%, #77C5D5 50%, #4A8CB5 100%)",
  },
};

/* ─── Growth System ─── */
const growthSections: Record<string, SectionMeta> = {
  introdução: {
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #E8B86D 0%, #F5D9A0 50%, #E8B86D 100%)",
  },
  "mercado e público": {
    icon: Users,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
  ofertas: {
    icon: Package,
    gradient: "linear-gradient(135deg, #D4645C 0%, #F09C96 50%, #D4645C 100%)",
  },
  estratégia: {
    icon: ChartLine,
    gradient: "linear-gradient(135deg, #C75B8E 0%, #E8A0C0 50%, #C75B8E 100%)",
  },
  produtos: {
    icon: ShoppingBag,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
};

/* ─── Content System (Estúdio Criativo) ─── */
const contentSections: Record<string, SectionMeta> = {
  "estúdio criativo": {
    icon: Clapperboard,
    gradient: "linear-gradient(135deg, #5CB8A4 0%, #8ED6C8 50%, #5CB8A4 100%)",
  },
  conteúdo: {
    icon: PenLine,
    gradient: "linear-gradient(135deg, #4A8CB5 0%, #77C5D5 50%, #4A8CB5 100%)",
  },
  "personas sintéticas": {
    icon: Bot,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
  touchpoints: {
    icon: Radio,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
};

/* ─── Pacote Cultural ─── */
const pacoteSections: Record<string, SectionMeta> = {
  "pacote cultural": {
    icon: Library,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
  livros: {
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #5CB8A4 0%, #8ED6C8 50%, #5CB8A4 100%)",
  },
  filmes: {
    icon: Film,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
  músicas: {
    icon: Music,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
  encerramento: {
    icon: Sparkles,
    gradient: "linear-gradient(135deg, #F4C3CC 0%, #F9DDE3 50%, #F4C3CC 100%)",
  },
};

/* ─── Playbook de Conteúdo ─── */
const playbookConteudoSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
    gradient: "linear-gradient(135deg, #4A8CB5 0%, #77C5D5 50%, #4A8CB5 100%)",
  },
  "pesquisa": {
    icon: Search,
    gradient: "linear-gradient(135deg, #5CB8A4 0%, #8ED6C8 50%, #5CB8A4 100%)",
  },
  enquadramento: {
    icon: Frame,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
  ferramentas: {
    icon: Wrench,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
  criativos: {
    icon: BrushIcon,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
};

/* ─── Playbook de Edição de Vídeos ─── */
const playbookVideosSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
    gradient: "linear-gradient(135deg, #4A8CB5 0%, #77C5D5 50%, #4A8CB5 100%)",
  },
  produção: {
    icon: Video,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
  métricas: {
    icon: Gauge,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
};

/* ─── Playbook de Operação ─── */
const playbookOperacaoSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
    gradient: "linear-gradient(135deg, #4A8CB5 0%, #77C5D5 50%, #4A8CB5 100%)",
  },
  comercial: {
    icon: Handshake,
    gradient: "linear-gradient(135deg, #5CB8A4 0%, #8ED6C8 50%, #5CB8A4 100%)",
  },
  papéis: {
    icon: UserCheck,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
  "sales": {
    icon: BadgeDollarSign,
    gradient: "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #3A913F 100%)",
  },
  roteiros: {
    icon: ScrollText,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
  "fluxos": {
    icon: Route,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
  outbound: {
    icon: Mail,
    gradient: "linear-gradient(135deg, #C75B8E 0%, #E8A0C0 50%, #C75B8E 100%)",
  },
  operacional: {
    icon: Settings,
    gradient: "linear-gradient(135deg, #D4645C 0%, #F09C96 50%, #D4645C 100%)",
  },
};

/* ─── Playbook de Gestão ─── */
const playbookGestaoSections: Record<string, SectionMeta> = {
  fundamentos: {
    icon: FlaskConical,
    gradient: "linear-gradient(135deg, #4A8CB5 0%, #77C5D5 50%, #4A8CB5 100%)",
  },
  operação: {
    icon: Settings,
    gradient: "linear-gradient(135deg, #5CB8A4 0%, #8ED6C8 50%, #5CB8A4 100%)",
  },
  contratação: {
    icon: UserCheck,
    gradient: "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  },
  sla: {
    icon: ClipboardList,
    gradient: "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  },
  roteiros: {
    icon: ScrollText,
    gradient: "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  },
  documentos: {
    icon: FileCheck,
    gradient: "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #3A913F 100%)",
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
};

/* Color pool for unknown sections - cycles through distinct hues */
const fallbackGradients = [
  "linear-gradient(135deg, #77C5D5 0%, #A8DDE8 50%, #77C5D5 100%)",
  "linear-gradient(135deg, #D6A461 0%, #FBDD7A 50%, #D6A461 100%)",
  "linear-gradient(135deg, #E07B5A 0%, #F4A98C 50%, #E07B5A 100%)",
  "linear-gradient(135deg, #5CB8A4 0%, #8ED6C8 50%, #5CB8A4 100%)",
  "linear-gradient(135deg, #9B6FD6 0%, #C5A3F0 50%, #9B6FD6 100%)",
  "linear-gradient(135deg, #C75B8E 0%, #E8A0C0 50%, #C75B8E 100%)",
  "linear-gradient(135deg, #3A913F 0%, #6BBF6F 50%, #3A913F 100%)",
  "linear-gradient(135deg, #F4C3CC 0%, #F9DDE3 50%, #F4C3CC 100%)",
];

const fallbackIcons: LucideIcon[] = [
  Globe, BookOpen, Sparkles, Package, ChartLine, Users, Wrench, Radio,
];

function getSectionMeta(title: string, index: number): SectionMeta {
  const key = title.toLowerCase();
  for (const [match, meta] of Object.entries(allSections)) {
    if (key.includes(match)) return meta;
  }
  return {
    icon: fallbackIcons[index % fallbackIcons.length],
    gradient: fallbackGradients[index % fallbackGradients.length],
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
          <CardTitle className="truncate font-heading text-sm font-semibold text-balance">
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
        <Link href={href} className="block">
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
      toast.error(message);
      setSubmitting(false);
    }
    // NÃO setSubmitting(false) no caminho de sucesso — a navegação cuida.
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-4 pb-8 max-[479px]:px-2 md:px-8 md:pt-5 md:pb-10">
      <div className="mb-8 px-2">
        <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance">
          {title}
        </h1>
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
        />
      </div>

      <div className="grid gap-3 px-2 sm:grid-cols-2">
        {sections.map((section, i) => (
          <SectionCard key={section.slug} section={section} basePath={basePath} index={i} />
        ))}
      </div>

      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <FileText className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Nenhuma seção encontrada.
          </p>
        </div>
      )}
    </div>
  );
}
