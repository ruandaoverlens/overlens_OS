"use client";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  EyeOff,
  Rocket,
  ShieldAlert,
  CheckSquare,
  Zap,
  Network,
  FileText,
  ArrowRight,
  Target,
  Clock,
  Users,
  AlertTriangle,
  Search,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────

export interface ReportSection {
  section_key: string;
  title: string;
  content: string;
  order_index: number;
}

interface MagnyReportContentProps {
  sections: ReportSection[];
}

interface ParsedCard {
  fields: Record<string, string>;
}

// ─── Brand color tokens (from globals.css, dark-only theme) ─
// Using raw oklch so we can apply alpha without relative-color syntax.

const COLORS = {
  sahara:      "oklch(0.751 0.103 73.232)",   // --brand-sahara / --warning
  calla:       "oklch(0.863 0.057 6.005)",    // --brand-calla
  midori:      "oklch(0.585 0.145 144.414)",  // --brand-midori / --success
  khewra:      "oklch(0.646 0.154 24.222)",   // --brand-khewra / --destructive
  atmos:       "oklch(0.779 0.08 212.201)",   // --brand-atmos  / --info
  surface500:  "oklch(0.719 0 0)",            // --surface-500
  surface600:  "oklch(0.482 0 0)",            // --surface-600
} as const;

/** Returns an oklch color with custom alpha */
function withAlpha(color: string, alpha: number): string {
  return color.replace(")", ` / ${alpha})`);
}

// ─── Helpers ───────────────────────────────────────────────

function slugifyKey(key: string): string {
  return key.replace(/_/g, "-").toLowerCase();
}

const SECTION_NUMBERS: Record<string, string> = {
  executive_summary: "01",
  news_radar: "02",
  connections_patterns: "03",
  insights: "04",
  blind_spots: "05",
  opportunities: "06",
  threats: "07",
  weekly_watchlist: "08",
};

const SECTION_TITLES: Record<string, string> = {
  executive_summary: "O Tabuleiro Mudou",
  news_radar: "Radar da Semana",
  connections_patterns: "O Que Conecta Tudo Isso",
  insights: "O Que Poucos Estão Vendo",
  blind_spots: "Onde Ninguém Está Olhando",
  opportunities: "Janelas Que Estão Abrindo",
  threats: "Riscos No Horizonte",
  weekly_watchlist: "Fique de Olho",
};

const SECTION_SUBTITLES: Record<string, string> = {
  executive_summary: "Os movimentos mais importantes da semana em 30 segundos",
  news_radar: "Fatos, sinais e ruídos — filtrados e priorizados",
  connections_patterns: "Padrões cruzados entre os sinais da semana",
  insights: "Insights estratégicos extraídos das entrelinhas",
  blind_spots: "Ângulos que o mercado ainda não cobriu",
  opportunities: "Oportunidades emergentes com janela de ação",
  threats: "Ameaças e riscos que merecem atenção agora",
  weekly_watchlist: "O que monitorar nos próximos 7 dias",
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  executive_summary: <FileText className="size-6" />,
  news_radar: <Zap className="size-6" />,
  connections_patterns: <Network className="size-6" />,
  insights: <Lightbulb className="size-6" />,
  blind_spots: <EyeOff className="size-6" />,
  opportunities: <Rocket className="size-6" />,
  threats: <ShieldAlert className="size-6" />,
  weekly_watchlist: <CheckSquare className="size-6" />,
};

// ─── Content Parsers ──────────────────────────────────────

function parsePipeCards(content: string): ParsedCard[] {
  const cards: ParsedCard[] = [];
  const lines = content.split("\n").filter((l) => l.trim());
  let currentLine = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\*\*[^*]+:\*\*/.test(trimmed)) {
      if (currentLine) {
        const card = parseSingleCard(currentLine);
        if (card) cards.push(card);
      }
      currentLine = trimmed;
    } else if (currentLine) {
      currentLine += " " + trimmed;
    }
  }

  if (currentLine) {
    const card = parseSingleCard(currentLine);
    if (card) cards.push(card);
  }

  return cards;
}

function parseSingleCard(line: string): ParsedCard | null {
  const fields: Record<string, string> = {};
  const segments = line.split("|").map((s) => s.trim());

  for (const segment of segments) {
    const match = segment.match(/^\*\*([^*]+):\*\*\s*(.[\s\S]*)/);
    if (match) {
      fields[match[1].trim()] = match[2].trim();
    }
  }

  return Object.keys(fields).length > 0 ? { fields } : null;
}

function parseWatchlistItems(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s*/, ""));
}

/** Extract the first markdown link URL from a string like [text](url) */
function extractUrl(text: string): string | null {
  const match = text.match(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/);
  return match ? match[2] : null;
}

/** Extract all URLs from all fields of a card */
function getCardSourceUrl(card: ParsedCard): string | null {
  for (const value of Object.values(card.fields)) {
    const url = extractUrl(value);
    if (url) return url;
  }
  return null;
}

function SourceLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      style={{ backgroundColor: withAlpha(COLORS.surface600, 0.1) }}
    >
      Fonte
      <ExternalLink className="size-3" />
    </a>
  );
}

// ─── Card Renderers ───────────────────────────────────────

function InsightCard({ card, index }: { card: ParsedCard; index: number }) {
  const insight = card.fields["Insight"] ?? "";
  const base = card.fields["Base"] ?? "";
  const implication =
    card.fields["Implicação prática"] ?? card.fields["Implicacao pratica"] ?? "";
  const sourceUrl = getCardSourceUrl(card);

  return (
    <Card
      className="gap-3 border-border/40 transition-all"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = withAlpha(COLORS.sahara, 0.25))}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <CardHeader className="gap-3 pb-0">
        <div className="flex items-center justify-between">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold"
            style={{ backgroundColor: withAlpha(COLORS.sahara, 0.1), color: COLORS.sahara }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {sourceUrl && <SourceLink url={sourceUrl} />}
        </div>
        <CardTitle className="justify-start text-base font-medium font-body">
          <span className="leading-snug text-left text-balance">{insight}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {base && (
          <div className="flex items-start gap-2.5">
            <Badge variant="secondary" className="mt-0.5 shrink-0 text-[11px]">
              Base
            </Badge>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{base}</p>
          </div>
        )}
        {implication && (
          <div
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: withAlpha(COLORS.midori, 0.06) }}
          >
            <ArrowRight className="mt-0.5 size-4.5 shrink-0" style={{ color: COLORS.midori }} />
            <p className="text-sm leading-relaxed text-pretty" style={{ color: withAlpha(COLORS.midori, 0.85) }}>
              {implication}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BlindSpotCard({ card, index }: { card: ParsedCard; index: number }) {
  const blindSpot = card.fields["Ponto cego"] ?? "";
  const reason =
    card.fields["Por que é cego"] ?? card.fields["Por que e cego"] ?? "";
  const verify = card.fields["Como verificar"] ?? "";
  const sourceUrl = getCardSourceUrl(card);

  return (
    <Card
      className="gap-3 border-border/40 transition-all"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = withAlpha(COLORS.calla, 0.25))}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <CardHeader className="gap-3 pb-0">
        <div className="flex items-center justify-between">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold"
            style={{ backgroundColor: withAlpha(COLORS.calla, 0.12), color: COLORS.calla }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {sourceUrl && <SourceLink url={sourceUrl} />}
        </div>
        <CardTitle className="justify-start text-base font-medium font-body">
          <span className="leading-snug text-left text-balance">{blindSpot}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reason && (
          <div className="flex items-start gap-2.5">
            <EyeOff className="mt-0.5 size-4.5 shrink-0" style={{ color: withAlpha(COLORS.calla, 0.6) }} />
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{reason}</p>
          </div>
        )}
        {verify && (
          <div
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: withAlpha(COLORS.atmos, 0.06) }}
          >
            <Search className="mt-0.5 size-4.5 shrink-0" style={{ color: COLORS.atmos }} />
            <p className="text-sm leading-relaxed text-pretty" style={{ color: withAlpha(COLORS.atmos, 0.85) }}>
              {verify}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OpportunityCard({ card, index }: { card: ParsedCard; index: number }) {
  const opportunity = card.fields["Oportunidade"] ?? "";
  const target = card.fields["Para quem"] ?? "";
  const window = card.fields["Janela"] ?? "";
  const firstStep = card.fields["Primeiro passo"] ?? "";
  const sourceUrl = getCardSourceUrl(card);

  return (
    <Card
      className="gap-3 border-border/40 transition-all"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = withAlpha(COLORS.midori, 0.25))}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <CardHeader className="gap-3 pb-0">
        <div className="flex items-center justify-between">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold"
            style={{ backgroundColor: withAlpha(COLORS.midori, 0.1), color: COLORS.midori }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {sourceUrl && <SourceLink url={sourceUrl} />}
        </div>
        <CardTitle className="justify-start text-base font-medium font-body">
          <span className="leading-snug text-left text-balance">{opportunity}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {target && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4.5" style={{ color: withAlpha(COLORS.midori, 0.6) }} />
              <span>{target}</span>
            </div>
          )}
          {window && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4.5" style={{ color: withAlpha(COLORS.sahara, 0.6) }} />
              <span>{window}</span>
            </div>
          )}
        </div>
        {firstStep && (
          <div
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: withAlpha(COLORS.midori, 0.06) }}
          >
            <TrendingUp className="mt-0.5 size-4.5 shrink-0" style={{ color: COLORS.midori }} />
            <p className="text-sm leading-relaxed text-pretty" style={{ color: withAlpha(COLORS.midori, 0.85) }}>
              {firstStep}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ThreatCard({ card, index }: { card: ParsedCard; index: number }) {
  const threat = card.fields["Ameaça"] ?? card.fields["Ameaca"] ?? "";
  const impact =
    card.fields["Cenário de impacto"] ?? card.fields["Cenario de impacto"] ?? "";
  const signals = card.fields["Sinais de alerta"] ?? "";
  const mitigation =
    card.fields["Mitigação sugerida"] ?? card.fields["Mitigacao sugerida"] ?? "";
  const sourceUrl = getCardSourceUrl(card);

  const impactVariant =
    impact.toLowerCase().includes("severo")
      ? "destructive"
      : impact.toLowerCase().includes("moderado")
        ? "warning"
        : "secondary";

  return (
    <Card
      className="gap-3 border-border/40 transition-all"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = withAlpha(COLORS.khewra, 0.25))}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      <CardHeader className="gap-3 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold"
              style={{ backgroundColor: withAlpha(COLORS.khewra, 0.1), color: COLORS.khewra }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {impact && (
              <Badge variant={impactVariant} className="text-[11px]">
                {impact}
              </Badge>
            )}
          </div>
          {sourceUrl && <SourceLink url={sourceUrl} />}
        </div>
        <CardTitle className="justify-start text-base font-medium font-body">
          <span className="leading-snug text-left text-balance">{threat}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {signals && (
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4.5 shrink-0" style={{ color: withAlpha(COLORS.sahara, 0.6) }} />
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{signals}</p>
          </div>
        )}
        {mitigation && (
          <div
            className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
            style={{ backgroundColor: withAlpha(COLORS.atmos, 0.06) }}
          >
            <Target className="mt-0.5 size-4.5 shrink-0" style={{ color: COLORS.atmos }} />
            <p className="text-sm leading-relaxed text-pretty" style={{ color: withAlpha(COLORS.atmos, 0.85) }}>
              {mitigation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistCards({ content }: { content: string }) {
  const items = parseWatchlistItems(content);
  if (items.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <Card
          key={i}
          className="border-border/40 py-3 transition-all"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = withAlpha(COLORS.atmos, 0.25))}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
        >
          <CardContent className="flex items-center gap-3">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold"
              style={{ backgroundColor: withAlpha(COLORS.atmos, 0.1), color: COLORS.atmos }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[15px] font-body leading-relaxed text-foreground/90 text-pretty">{item}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Section Renderers ────────────────────────────────────

function renderSectionContent(sectionKey: string, content: string) {
  switch (sectionKey) {
    case "insights": {
      const cards = parsePipeCards(content);
      if (cards.length > 0) {
        return (
          <div className="grid gap-4">
            {cards.map((card, i) => (
              <InsightCard key={i} card={card} index={i} />
            ))}
          </div>
        );
      }
      break;
    }
    case "blind_spots": {
      const cards = parsePipeCards(content);
      if (cards.length > 0) {
        return (
          <div className="grid gap-4">
            {cards.map((card, i) => (
              <BlindSpotCard key={i} card={card} index={i} />
            ))}
          </div>
        );
      }
      break;
    }
    case "opportunities": {
      const cards = parsePipeCards(content);
      if (cards.length > 0) {
        return (
          <div className="grid gap-4">
            {cards.map((card, i) => (
              <OpportunityCard key={i} card={card} index={i} />
            ))}
          </div>
        );
      }
      break;
    }
    case "threats": {
      const cards = parsePipeCards(content);
      if (cards.length > 0) {
        return (
          <div className="grid gap-4">
            {cards.map((card, i) => (
              <ThreatCard key={i} card={card} index={i} />
            ))}
          </div>
        );
      }
      break;
    }
    case "weekly_watchlist": {
      return <WatchlistCards content={content} />;
    }
  }

  // Fallback: markdown (executive_summary, news_radar, connections)
  return <MarkdownRenderer content={content} />;
}

// ─── Component ─────────────────────────────────────────────

export function MagnyReportContent({ sections }: MagnyReportContentProps) {
  const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-16">
      {sorted.map((section, index) => {
        const anchor = slugifyKey(section.section_key);
        const sectionNumber = SECTION_NUMBERS[section.section_key] ?? null;
        const displayTitle = SECTION_TITLES[section.section_key] ?? section.title;
        const subtitle = SECTION_SUBTITLES[section.section_key] ?? null;
        const icon = SECTION_ICONS[section.section_key] ?? null;
        const isLast = index === sorted.length - 1;

        return (
          <section key={section.section_key} id={anchor} className="scroll-mt-8">
            {/* Section header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {sectionNumber && (
                  <span className="font-mono text-base tabular-nums" style={{ color: "var(--surface-200)" }}>
                    {sectionNumber}
                  </span>
                )}
                {icon && (
                  <span style={{ color: COLORS.surface500 }}>{icon}</span>
                )}
                <h2 className="font-heading text-2xl font-medium tracking-normal text-foreground uppercase text-balance">
                  {displayTitle}
                </h2>
              </div>
              {subtitle && (
                <p
                  className="text-sm"
                  style={{ color: COLORS.surface600 }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Section content */}
            <div>{renderSectionContent(section.section_key, section.content)}</div>

            {/* Section divider */}
            {!isLast && <Separator className="mt-16" />}
          </section>
        );
      })}

      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma seção encontrada neste relatório.
          </p>
        </div>
      )}
    </div>
  );
}
