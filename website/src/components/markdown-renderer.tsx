import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { ColorPalette } from "@/components/color-palette";
import { IconGallery } from "@/components/icons/icon-gallery";

// ─── Content parsing (exported for use in page files) ──────────────

export interface ParsedContent {
  content: string;
  description: string | null;
}

/**
 * Strip leading H1s and extract the first H2 as a description
 * (the evocative subtitle pattern used across the Brand System).
 */
export function parseLeadingContent(raw: string): ParsedContent {
  const lines = raw.split("\n");
  const result: string[] = [];
  let pastLeading = false;
  let description: string | null = null;
  let capturedDescription = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!pastLeading) {
      if (trimmed === "") continue;
      if (/^# /.test(trimmed)) continue;
      if (!capturedDescription && /^## /.test(trimmed)) {
        description = trimmed.replace(/^## /, "");
        capturedDescription = true;
        pastLeading = true;
        continue;
      }
      pastLeading = true;
    }
    result.push(lines[i]);
  }

  return { content: result.join("\n"), description };
}

export function isIntroPage(title: string): boolean {
  const lower = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return lower === "introducao" || lower === "introdução" || lower === "introducion";
}

// ─── Component ─────────────────────────────────────────────────────

const CUSTOM_COMPONENTS: Record<string, React.ComponentType> = {
  "color-palette": ColorPalette,
  "icon-gallery": IconGallery,
};

const COMPONENT_TAG_RE = /<(color-palette|icon-gallery)\s*(?:\/>|><\/\1>)/g;

function splitByCustomTags(md: string): Array<{ type: "md"; value: string } | { type: "component"; name: string }> {
  const parts: Array<{ type: "md"; value: string } | { type: "component"; name: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = COMPONENT_TAG_RE.exec(md)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "md", value: md.slice(lastIndex, match.index) });
    }
    parts.push({ type: "component", name: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < md.length) {
    parts.push({ type: "md", value: md.slice(lastIndex) });
  }

  return parts;
}

export function MarkdownRenderer({ content, title }: { content: string; title?: string }) {
  const { content: cleaned, description } = parseLeadingContent(content);
  const segments = splitByCustomTags(cleaned);

  return (
    <article className="max-w-none space-y-6 text-[15px] leading-relaxed text-pretty text-muted-foreground">
      {title && (
        <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
          {title}
        </h1>
      )}
      {description && (
        <p className="text-[19px] italic leading-[1.75] text-balance text-[var(--surface-200)]">
          {description}
        </p>
      )}
      {segments.map((segment, i) => {
        if (segment.type === "component") {
          const Comp = CUSTOM_COMPONENTS[segment.name];
          return Comp ? <Comp key={i} /> : null;
        }
        return (
      <ReactMarkdown
        key={i}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-heading text-[40px] font-normal uppercase tracking-normal leading-none text-balance text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => {
            const text = typeof children === "string" ? children : Array.isArray(children) ? children.map((c) => (typeof c === "string" ? c : "")).join("") : "";
            const isInter = text.trim().toUpperCase() === "INTER";
            const isOutfit = text.trim().toUpperCase() === "OUTFIT";
            const fontClass = isInter ? "font-body" : isOutfit ? "font-heading uppercase" : "font-body";
            return (
              <h2 className={`mt-12 mb-4 text-[28px] font-medium tracking-tight text-balance text-foreground first:mt-0 ${fontClass}`}>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 font-body text-[22px] font-medium text-balance text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-6 mb-2 font-body text-sm font-medium text-balance text-muted-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => {
            const childArray = Array.isArray(children) ? children : [children];
            const firstChild = childArray[0];

            /* Italic-only paragraph = subtitle (e.g. *Direção vem sempre antes do esforço*) */
            const isItalicOnly =
              childArray.length === 1 &&
              typeof firstChild === "object" &&
              firstChild !== null &&
              "type" in firstChild &&
              (firstChild as React.ReactElement).type === "em";

            if (isItalicOnly) {
              return (
                <p className="text-[19px] italic leading-[1.75] text-balance text-[var(--surface-200)]">
                  {children}
                </p>
              );
            }

            const isBoldParagraph =
              childArray.length >= 1 &&
              typeof firstChild === "object" &&
              firstChild !== null &&
              "type" in firstChild &&
              (firstChild as React.ReactElement).type === "strong";

            if (isBoldParagraph) {
              return (
                <div className="rounded-lg border border-border/50 bg-accent/30 px-4 py-3 text-sm text-pretty text-foreground">
                  {children}
                </div>
              );
            }

            return <p className="text-[15px] leading-[1.75] text-pretty">{children}</p>;
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          ul: ({ children }) => {
            const items = Array.isArray(children) ? children : [children];
            const hasBoldItems = items.some((child) => {
              if (
                typeof child === "object" &&
                child !== null &&
                "props" in child
              ) {
                const liChildren = child.props?.children;
                const first = Array.isArray(liChildren)
                  ? liChildren[0]
                  : liChildren;
                return (
                  typeof first === "object" &&
                  first !== null &&
                  "type" in first &&
                  (first as React.ReactElement).type === "strong"
                );
              }
              return false;
            });

            if (hasBoldItems) {
              return (
                <ul className="grid gap-3 pl-0 list-none sm:grid-cols-2">
                  {children}
                </ul>
              );
            }

            return (
              <ul className="space-y-2 pl-0 list-none">{children}</ul>
            );
          },
          ol: ({ children }) => (
            <ol className="space-y-2 pl-5 list-decimal marker:text-muted-foreground/60">{children}</ol>
          ),
          li: ({ children }) => {
            const childArray = Array.isArray(children) ? children : [children];
            const firstChild = childArray[0];
            const hasBold =
              typeof firstChild === "object" &&
              firstChild !== null &&
              "type" in firstChild &&
              (firstChild as React.ReactElement).type === "strong";

            if (hasBold) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const boldContent = (firstChild as any).props?.children;
              const rest = childArray.slice(1);
              // Remove leading ": " or " - " from the description
              let description = rest;
              if (typeof rest[0] === "string") {
                const cleaned = rest[0].replace(/^[:\s-–\-]+/, "");
                description = [cleaned, ...rest.slice(1)];
              }

              return (
                <li className="group rounded-xl border border-border/40 bg-accent/20 p-4 transition-colors hover:bg-accent/40">
                  <span className="block text-sm font-semibold text-foreground">
                    {boldContent}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground text-pretty">
                    {description}
                  </span>
                </li>
              );
            }

            return (
              <li className="rounded-lg border border-border/40 bg-accent/20 px-4 py-3 text-sm leading-relaxed text-pretty text-foreground/90 [&>strong]:text-foreground">
                {children}
              </li>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 pl-6 text-[20px] italic leading-relaxed text-pretty text-foreground/80">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary no-underline hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className={className}>{children}</code>
              );
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
              {children}
            </pre>
          ),
          figure: ({ children }) => (
            <figure className="space-y-2">{children}</figure>
          ),
          figcaption: ({ children }) => (
            <figcaption className="text-center text-xs italic text-muted-foreground/70">
              {children}
            </figcaption>
          ),
          hr: () => <hr className="my-8 border-border/50" />,
          img: ({ src, alt, style, ...rest }) => {
            let resolvedSrc = src;
            if (typeof src === "string" && src.startsWith("/brand/images/")) {
              const filename = src.replace("/brand/images/", "");
              resolvedSrc = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/asset-previews/Imagens/${filename}`;
            }
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolvedSrc} alt={alt || ""} className="rounded-lg" style={style} {...rest} />
            );
          },
          table: ({ children }) => (
            <div className="-mr-6 overflow-x-auto scrollbar-hidden lg:mr-0 lg:rounded-lg lg:border lg:border-border">
              <table className="w-max min-w-full text-sm lg:w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-accent/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-foreground align-top">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border/50 px-4 py-3 align-top leading-relaxed text-pretty">
              {children}
            </td>
          ),
        }}
      >
        {segment.value}
      </ReactMarkdown>
        );
      })}
    </article>
  );
}
