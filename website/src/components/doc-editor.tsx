"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
// Ícones sem equivalente em @/components/icons (formatação, desfazer/refazer,
// tabela, remover link — verificado) seguem no lucide.
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Link2Off,
  Undo2,
  Redo2,
  Table2,
} from "lucide-react";
import {
  SmArrowDownIosLineIcon,
  SmImageLineIcon,
  SmLink2LineIcon,
  SmMinusLineIcon,
} from "@/components/icons";
import { notify } from "@/lib/notifications/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { DocSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SecondaryTopbar, TopbarPageActions } from "@/components/topbar-slots";
import { resolveBrandImageSrc, toBrandImagePath } from "@/lib/brand-images";
import { Figure, Figcaption, collapseFigures } from "@/components/doc-editor-figure";

/*
 * Componentes customizados do markdown (`<color-palette />`, `<icon-gallery />`)
 * não são nós do editor. Antes de carregar, viram um marcador de texto que
 * sobrevive ao round-trip markdown → editor → markdown; no salvamento, o
 * marcador volta a ser a tag original.
 */
const COMPONENT_TAG_RE = /<(color-palette|icon-gallery)\s*(?:\/>|><\/\1>)/g;
const COMPONENT_MARK_RE = /\{\{componente:(color-palette|icon-gallery)\}\}/g;

/*
 * O ponto de qualidade do dado (`<dado q="A" fonte="..." />`) é inline e também
 * não é nó do editor: vira `{{dado:...}}` na carga e volta a ser tag no
 * salvamento, com os atributos preservados.
 */
const DADO_TAG_RE = /<dado\b([^>]*?)\/?>(?:<\/dado>)?/gi;
const DADO_MARK_RE = /\{\{dado:([^}]*)\}\}/g;

function protectComponents(md: string): string {
  return md
    .replace(COMPONENT_TAG_RE, (_m, name) => `{{componente:${name}}}`)
    .replace(DADO_TAG_RE, (_m, attrs: string) => `{{dado:${attrs.trim()}}}`);
}

function restoreComponents(md: string): string {
  return md
    .replace(COMPONENT_MARK_RE, (_m, name) => `<${name} />`)
    .replace(DADO_MARK_RE, (_m, attrs: string) => `<dado ${attrs.trim()} />`);
}

/*
 * As imagens antigas são gravadas como `/brand/images/<arquivo>` e resolvidas
 * para o storage só na renderização. Dentro do Tiptap esse caminho não existe
 * (nada é servido de `public/brand/images`), então a imagem aparecia quebrada:
 * resolvemos na carga e desfazemos no salvamento, para o markdown continuar
 * guardando o caminho curto.
 */
/*
 * A página publicada descarta o H1 do markdown e usa o título do documento
 * (`parseLeadingContent` + a prop `title` do MarkdownRenderer). O editor faz o
 * mesmo: o H1 sai da área editável, o título real aparece no topo e a linha
 * original volta ao markdown no salvamento.
 */
function splitLeadingH1(md: string): { heading: string | null; body: string } {
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length || !/^#\s+/.test(lines[i].trim())) {
    return { heading: null, body: md };
  }
  return {
    heading: lines[i].trim(),
    body: lines.slice(i + 1).join("\n").replace(/^\n+/, ""),
  };
}

const MARKDOWN_IMAGE_RE = /(!\[[^\]]*\]\()([^)\s]+)/g;
const HTML_IMAGE_RE = /(<img[^>]*?src=")([^"]+)/g;

function mapImageSources(md: string, map: (src: string) => string): string {
  return md
    .replace(MARKDOWN_IMAGE_RE, (_m, prefix: string, src: string) => `${prefix}${map(src)}`)
    .replace(HTML_IMAGE_RE, (_m, prefix: string, src: string) => `${prefix}${map(src)}`);
}

// ─── Toolbar ─────────────────────────────────────────────

type BlockKind = "paragraph" | "h1" | "h2" | "h3" | "h4" | "blockquote";

const BLOCK_OPTIONS: { value: BlockKind; label: string; className: string }[] = [
  { value: "paragraph", label: "Texto normal", className: "text-sm" },
  // As previews reproduzem o estilo real em escala reduzida: o h1 renderiza em
  // `font-heading text-display uppercase tracking-normal` (markdown-renderer).
  { value: "h1", label: "Título 1", className: "font-heading text-2xl font-normal uppercase tracking-normal leading-none" },
  { value: "h2", label: "Título 2", className: "text-lg font-medium" },
  { value: "h3", label: "Título 3", className: "text-base font-medium" },
  { value: "h4", label: "Título 4", className: "text-sm font-medium text-muted-foreground" },
  { value: "blockquote", label: "Citação", className: "text-sm italic" },
];

function currentBlock(editor: Editor): BlockKind {
  if (editor.isActive("blockquote")) return "blockquote";
  for (const level of [1, 2, 3, 4] as const) {
    if (editor.isActive("heading", { level })) return `h${level}` as BlockKind;
  }
  return "paragraph";
}

function applyBlock(editor: Editor, kind: BlockKind) {
  const chain = editor.chain().focus();
  // Sai da citação antes de trocar o bloco, para não aninhar.
  if (editor.isActive("blockquote") && kind !== "blockquote") chain.toggleBlockquote();
  switch (kind) {
    case "paragraph":
      chain.setParagraph().run();
      break;
    case "blockquote":
      chain.setParagraph().toggleBlockquote().run();
      break;
    default:
      chain.setHeading({ level: Number(kind[1]) as 1 | 2 | 3 | 4 }).run();
  }
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
          className={cn(
            "shrink-0 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40",
            active && "bg-accent text-foreground",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Limite de upload de imagem no editor. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_FORMATS_LABEL = "PNG, JPG, WebP, GIF ou SVG até 10 MB";

/**
 * Normaliza e valida um endereço digitado: domínios sem esquema ganham
 * `https://`; aceita apenas http(s), mailto ou caminhos internos (`/`).
 * Retorna `null` quando inválido (ex.: `javascript:`).
 */
function normalizeHref(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  const candidate = /^(https?:|mailto:|\/)/i.test(url)
    ? url
    : /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(url)
      ? `https://${url}`
      : url;
  if (candidate.startsWith("/")) return candidate;
  if (/^mailto:.+@.+/i.test(candidate)) return candidate;
  if (!/^https?:\/\/\S+$/i.test(candidate)) return null;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function normalizeImageSrc(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  const candidate = /^(https?:|\/)/i.test(url) ? url : `https://${url}`;
  if (candidate.startsWith("/")) return candidate;
  if (!/^https?:\/\/\S+$/i.test(candidate)) return null;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />;
}

function LinkControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();
  const isActive = editor.isActive("link");

  const apply = () => {
    const url = href.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setOpen(false);
      return;
    }
    const normalized = normalizeHref(url);
    if (!normalized) {
      setError("Use um endereço que comece com http:// ou https://.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
    setError(null);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor.getAttributes("link").href as string | undefined) ?? "");
        setError(null);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Inserir link"
          aria-pressed={isActive}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "shrink-0 rounded-md text-muted-foreground hover:text-foreground",
            isActive && "bg-accent text-foreground",
          )}
        >
          <SmLink2LineIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-2 p-3">
        <p className="text-xs text-muted-foreground">
          {editor.state.selection.empty && !isActive
            ? "Selecione um texto para transformar em link."
            : "Endereço do link"}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Label htmlFor={inputId} className="sr-only">
              Endereço do link
            </Label>
            <Input
              id={inputId}
              size="sm"
              autoFocus
              type="text"
              inputMode="url"
              placeholder="https://"
              value={href}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                setHref(e.target.value);
                if (error) setError(null);
              }}
            />
            <Button type="submit" size="sm" variant="default">
              Aplicar
            </Button>
          </div>
          {error && <FieldError className="text-caption" id={errorId}>{error}</FieldError>}
        </form>
        {isActive && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setOpen(false);
            }}
          >
            <Link2Off className="size-4" />
            Remover link
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ImageControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // XHR guardado para permitir cancelar o envio em andamento.
  const uploadXhrRef = useRef<XMLHttpRequest | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlInputId = useId();
  const urlErrorId = useId();
  const uploadHintId = useId();
  const uploadErrorId = useId();

  const insert = (src: string, alt = "") => {
    editor.chain().focus().setImage({ src, alt }).run();
    setUrl("");
    setUrlError(null);
    setUploadError(null);
    setOpen(false);
  };

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(`"${file.name}" não é uma imagem. Formatos aceitos: ${IMAGE_FORMATS_LABEL}.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError(`"${file.name}" ultrapassa 10 MB. Reduza a imagem e tente de novo.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploadError(null);
    setUploadProgress(0);
    setUploading(true);
    try {
      // XHR (e não fetch) para ter evento de progresso; `abort()` cancela o envio.
      const json = await new Promise<{ url?: string; error?: string }>((resolve, reject) => {
        const form = new FormData();
        form.append("file", file);
        const xhr = new XMLHttpRequest();
        uploadXhrRef.current = xhr;
        xhr.open("POST", "/api/docs/upload-image");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          let parsed: { url?: string; error?: string } = {};
          try { parsed = JSON.parse(xhr.responseText) as { url?: string; error?: string }; } catch { /* resposta não-JSON */ }
          if (xhr.status >= 200 && xhr.status < 300 && parsed.url) resolve(parsed);
          else reject(new Error(parsed.error ?? "Erro ao enviar a imagem"));
        };
        xhr.onerror = () => reject(new Error("Erro de rede ao enviar a imagem"));
        xhr.onabort = () => reject(new DOMException("Envio cancelado", "AbortError"));
        xhr.send(form);
      });
      insert(json.url!, file.name.replace(/\.[^.]+$/, ""));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setUploadError(null);
      } else {
        const message = err instanceof Error ? err.message : "Erro ao enviar a imagem";
        setUploadError(message);
        notify.fromError(err, "Erro ao enviar a imagem");
      }
    } finally {
      uploadXhrRef.current = null;
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const cancelUpload = () => uploadXhrRef.current?.abort();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Enquanto envia, fechar cancelaria o upload sem aviso.
        if (!next && uploading) return;
        if (next) {
          setUploadError(null);
          setUrlError(null);
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Inserir imagem"
          onMouseDown={(e) => e.preventDefault()}
          className="shrink-0 rounded-md text-muted-foreground hover:text-foreground"
        >
          <SmImageLineIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3 p-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <div className="space-y-1.5">
          {uploading ? (
            <div className="flex items-center gap-2">
              <p
                aria-live="polite"
                className="flex-1 text-caption text-muted-foreground"
              >
                Enviando… {uploadProgress}%
              </p>
              <Button type="button" size="sm" variant="ghost" onClick={cancelUpload}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              aria-describedby={uploadError ? `${uploadHintId} ${uploadErrorId}` : uploadHintId}
              onClick={() => fileRef.current?.click()}
            >
              <SmImageLineIcon className="size-4" />
              Enviar do computador
            </Button>
          )}
          <p id={uploadHintId} className="text-caption text-muted-foreground">
            {IMAGE_FORMATS_LABEL}
          </p>
          {uploadError && <FieldError className="text-caption" id={uploadErrorId}>{uploadError}</FieldError>}
        </div>
        <div className="flex items-center gap-2 text-caption uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou por URL
          <span className="h-px flex-1 bg-border" />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!url.trim()) {
              setUrlError("Informe o endereço da imagem.");
              return;
            }
            const src = normalizeImageSrc(url);
            if (!src) {
              setUrlError("Use um endereço que comece com http:// ou https://.");
              return;
            }
            insert(src);
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <Label htmlFor={urlInputId} className="sr-only">
              URL da imagem
            </Label>
            <Input
              id={urlInputId}
              size="sm"
              autoFocus
              type="text"
              inputMode="url"
              placeholder="https://…/imagem.png"
              disabled={uploading}
              value={url}
              aria-invalid={urlError ? true : undefined}
              aria-describedby={urlError ? urlErrorId : undefined}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
            />
            <Button type="submit" size="sm" variant="default" disabled={uploading}>
              Inserir
            </Button>
          </div>
          {urlError && <FieldError className="text-caption" id={urlErrorId}>{urlError}</FieldError>}
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const block = currentBlock(editor);
  const blockLabel = BLOCK_OPTIONS.find((o) => o.value === block)?.label ?? "Texto normal";

  return (
    <div
      role="toolbar"
      aria-label="Formatação"
      className="scrollbar-hidden flex items-center gap-0.5 overflow-x-auto px-1 py-1"
    >
      <ToolButton label="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>

      <ToolbarDivider />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Estilo do bloco: ${blockLabel}`}
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-9 shrink-0 items-center gap-1 rounded-md px-2 text-sm text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <span className="min-w-[88px] text-left">{blockLabel}</span>
            <SmArrowDownIosLineIcon className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {BLOCK_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              className={cn("h-9 cursor-pointer", opt.className, block === opt.value && "bg-accent/50")}
              onSelect={() => applyBlock(editor, opt.value)}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolbarDivider />

      <ToolButton label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Sublinhado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <ToolButton label="Código" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="size-4" />
      </ToolButton>

      <ToolbarDivider />

      <ToolButton label="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolButton>

      <ToolbarDivider />

      <LinkControl editor={editor} />
      <ImageControl editor={editor} />
      <ToolButton
        label="Tabela"
        active={editor.isActive("table")}
        onClick={() =>
          editor.isActive("table")
            ? editor.chain().focus().deleteTable().run()
            : editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <Table2 className="size-4" />
      </ToolButton>
      <ToolButton label="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <SmMinusLineIcon className="size-4" />
      </ToolButton>
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────

export function DocEditor({
  initialMarkdown,
  title,
  saving,
  onSave,
  onCancel,
}: {
  initialMarkdown: string;
  /** Título exibido na página publicada — o H1 do markdown não vai para a tela. */
  title?: string;
  saving: boolean;
  onSave: (markdown: string, title?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [dirty, setDirty] = useState(false);
  const confirm = useConfirm();
  // `useState(fn)` guarda o H1 original: o markdown inicial não muda de
  // identidade durante a edição, e o heading precisa sobreviver ao salvamento.
  const [{ heading: leadingH1, body: editableMarkdown }] = useState(() =>
    splitLeadingH1(initialMarkdown),
  );
  // O título é editável junto do texto; vazio devolve a página ao nome do arquivo.
  const [draftTitle, setDraftTitle] = useState(title ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    // Entrar em modo de edição já coloca o cursor no texto.
    autofocus: "start",
    // A toolbar lê `editor.isActive(...)` a cada render — sem isso o v3 não
    // re-renderiza em mudanças de seleção e os botões ficam desatualizados.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Comece a escrever…" }),
      Figure,
      Figcaption,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown,
    ],
    // As imagens são resolvidas ainda na sintaxe markdown, antes de o bloco
    // `<figure>` virar HTML de uma linha.
    content: collapseFigures(mapImageSources(protectComponents(editableMarkdown), resolveBrandImageSrc)),
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "doc-editor outline-none",
        spellcheck: "true",
        lang: "pt-BR",
        "aria-label": "Conteúdo da página",
      },
    },
    onUpdate: () => setDirty(true),
  });

  // Aviso do navegador ao sair com alterações não salvas.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleSave = useCallback(async () => {
    // Mesma guarda do botão: sem isso o Ctrl+S salva mesmo com o botão inativo
    // (e um segundo atalho dispararia um save duplicado).
    if (!editor || saving || !dirty) return;
    const body = mapImageSources(restoreComponents(editor.getMarkdown()), toBrandImagePath);
    const markdown = leadingH1 ? `${leadingH1}\n\n${body}` : body;
    try {
      await onSave(markdown, draftTitle.trim() || undefined);
      // Só limpa o estado "sujo" quando o save realmente deu certo.
      setDirty(false);
    } catch {
      // A falha já foi notificada por quem salva; manter `dirty` preserva o
      // botão Salvar, o aviso de saída e a confirmação do Cancelar.
    }
  }, [editor, onSave, saving, dirty, leadingH1, draftTitle]);

  // Ctrl/Cmd+S salva.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        // Digitando na URL de link/imagem (popover), Ctrl+S não é do documento.
        const target = e.target as HTMLElement | null;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const handleCancel = async () => {
    if (dirty) {
      const ok = await confirm({
        title: "Descartar as alterações não salvas?",
        description: "O texto editado nesta sessão será perdido.",
        confirmLabel: "Descartar",
        cancelLabel: "Continuar editando",
        destructive: true,
      });
      if (!ok) return;
    }
    onCancel();
  };

  if (!editor) {
    return <DocSkeleton />;
  }

  return (
    <div>
      {/* Cancelar/Salvar ficam na topbar principal, junto das demais ações de
          página; a segunda barra carrega só a toolbar de formatação. */}
      <TopbarPageActions>
        <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => void handleCancel()} disabled={saving}>
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-8"
          onClick={() => void handleSave()}
          disabled={!dirty}
          loading={saving}
          loadingText="Salvando…"
        >
          Salvar
        </Button>
      </TopbarPageActions>

      {/* A barra ocupa toda a largura, como uma segunda topbar sob a principal.
          O `-ml-2` desconta o padding do primeiro botão para o ícone nascer na
          mesma coluna do breadcrumb logo acima. */}
      <SecondaryTopbar>
        <div className="flex h-11 w-full items-center px-4 md:px-5">
          <div className="-ml-3 min-w-0 flex-1">
            <Toolbar editor={editor} />
          </div>
        </div>
      </SecondaryTopbar>

      {/* Mesmas classes do H1 do MarkdownRenderer, e o `space-y-6` que o
          <article> publicado aplica entre os blocos. */}
      <div className="space-y-6">
        {/* O título é um campo, com as classes do H1 publicado: o `uppercase`
            é só apresentação, o valor salvo preserva o que foi digitado. */}
        <textarea
          value={draftTitle}
          onChange={(e) => {
            setDraftTitle(e.target.value.replace(/\n/g, ""));
            setDirty(true);
          }}
          rows={1}
          maxLength={120}
          spellCheck
          lang="pt-BR"
          aria-label="Título da página"
          placeholder="Título da página"
          className="block w-full resize-none overflow-hidden bg-transparent p-0 field-sizing-content font-heading text-display font-normal uppercase tracking-normal leading-none text-balance text-foreground outline-none placeholder:text-surface-600 focus-visible:ring-transparent"
        />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
