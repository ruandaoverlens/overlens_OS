import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ─── Types ───────────────────────────────────────────────

export interface DocFrontmatter {
  title?: string;
  summary?: string;
  topics?: string[];
  keywords?: string[];
  priority?: "high" | "medium" | "low";
  ai_when_to_use?: string;
  related?: string[];
}

export interface DocFile {
  slug: string;
  title: string;
  order: number;
  content: string;
  segments: string[];
  frontmatter: DocFrontmatter | null;
}

export interface DocSection {
  slug: string;
  title: string;
  order: number;
  files: DocFile[];
  children: DocSection[];
  segments: string[];
}

// ─── Constants ───────────────────────────────────────────

/** Resolve a TRU sub-path, trying ./content/ first (Vercel), then ../TRU/ (local dev). */
function resolveTRU(...subpath: string[]): string {
  const internal = path.resolve(process.cwd(), "content", ...subpath);
  if (fs.existsSync(internal)) return internal;
  return path.resolve(process.cwd(), "..", "TRU", ...subpath);
}

const BRAND_SYSTEM_DIR = resolveTRU("brand_system");
const ESTUDIO_DIR = resolveTRU("estudio_criativo");
const GROWTH_DIR = resolveTRU("growth_system");
const PACOTE_DIR = resolveTRU("pacote_cultural");
const PLAYBOOK_CONTEUDO_DIR = resolveTRU("estudio_criativo", "03 - Playbook de Conteúdo");
const PLAYBOOK_VIDEOS_DIR = resolveTRU("estudio_criativo", "04 - Playbook de Edição de Vídeos");

// ─── Helpers ─────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractOrder(name: string): { order: number; title: string } {
  const match = name.match(/^(\d+)\s*[-–]?\s*(.+)$/);
  if (match) return { order: parseInt(match[1], 10), title: capitalize(match[2].trim()) };
  return { order: 999, title: capitalize(name) };
}

function cleanFileTitle(filename: string): string {
  const name = filename.replace(/\.md$/, "");
  const cleaned = name.replace(/^\[PAGINA\]\s*/, "");
  const { title } = extractOrder(cleaned);
  return title;
}

// ─── Recursive scanner ───────────────────────────────────

function scanDir(
  dirPath: string,
  parentSegments: string[] = []
): DocSection | null {
  if (!fs.existsSync(dirPath)) return null;

  const dirName = path.basename(dirPath);
  const { order, title } = extractOrder(dirName);
  const currentSegments = [...parentSegments, slugify(dirName)];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const files: DocFile[] = [];
  const children: DocSection[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      if (entry.name === "Extrações" || entry.name === "Revisões") continue;

      const child = scanDir(path.join(dirPath, entry.name), currentSegments);
      if (child && (child.files.length > 0 || child.children.length > 0)) {
        children.push(child);
      }
    } else if (entry.name.endsWith(".md")) {
      const fileTitle = cleanFileTitle(entry.name);
      const fileSlug = slugify(entry.name.replace(/\.md$/, ""));
      const { order: fileOrder } = extractOrder(
        entry.name.replace(/\.md$/, "").replace(/^\[PAGINA\]\s*/, "")
      );
      const raw = fs.readFileSync(
        path.join(dirPath, entry.name),
        "utf-8"
      );
      const parsed = matter(raw);
      const content = parsed.content;
      const frontmatter = (Object.keys(parsed.data).length > 0 ? parsed.data : null) as DocFrontmatter | null;

      files.push({
        slug: fileSlug,
        title: fileTitle,
        order: fileOrder,
        content,
        segments: [...currentSegments, fileSlug],
        frontmatter,
      });
    }
  }

  files.sort((a, b) => a.order - b.order);
  children.sort((a, b) => a.order - b.order);

  return {
    slug: slugify(dirName),
    title,
    order,
    files,
    children,
    segments: currentSegments,
  };
}

// ─── Generic scanner for any content dir ─────────────────

function scanContentDir(dir: string): DocSection[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const sections: DocSection[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;

    const section = scanDir(path.join(dir, entry.name), []);
    if (section && (section.files.length > 0 || section.children.length > 0)) {
      sections.push(section);
    }
  }

  sections.sort((a, b) => a.order - b.order);
  return sections;
}

/** Scans a flat dir where .md files sit at root (no subfolders required). */
function scanFlatContentDir(dir: string): DocSection[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: DocFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      // still support subfolders if they exist
      const section = scanDir(path.join(dir, entry.name), []);
      if (section && (section.files.length > 0 || section.children.length > 0)) {
        // wrap subfolder as a section containing its files
        return scanContentDir(dir);
      }
    } else if (entry.name.endsWith(".md")) {
      const fileTitle = cleanFileTitle(entry.name);
      const fileSlug = slugify(entry.name.replace(/\.md$/, ""));
      const { order: fileOrder } = extractOrder(
        entry.name.replace(/\.md$/, "").replace(/^\[PAGINA\]\s*/, "")
      );
      const raw = fs.readFileSync(path.join(dir, entry.name), "utf-8");
      const parsed = matter(raw);
      const content = parsed.content;
      const frontmatter = (Object.keys(parsed.data).length > 0 ? parsed.data : null) as DocFrontmatter | null;

      files.push({
        slug: fileSlug,
        title: fileTitle,
        order: fileOrder,
        content,
        segments: [fileSlug],
        frontmatter,
      });
    }
  }

  files.sort((a, b) => a.order - b.order);

  // Each file becomes its own single-file section (renders as direct link)
  return files.map((f) => ({
    slug: f.slug,
    title: f.title,
    order: f.order,
    files: [f],
    children: [],
    segments: [f.slug],
  }));
}

/** Scans a playbook dir: root .md files become a top section, subdirs become children. */
function scanPlaybookDir(dir: string): DocSection[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const rootFiles: DocFile[] = [];
  const sections: DocSection[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      if (entry.name === "Extrações" || entry.name === "Revisões") continue;
      const section = scanDir(path.join(dir, entry.name), []);
      if (section && (section.files.length > 0 || section.children.length > 0)) {
        sections.push(section);
      }
    } else if (entry.name.endsWith(".md")) {
      const fileTitle = cleanFileTitle(entry.name);
      const fileSlug = slugify(entry.name.replace(/\.md$/, ""));
      const { order: fileOrder } = extractOrder(
        entry.name.replace(/\.md$/, "").replace(/^\[PAGINA\]\s*/, "")
      );
      const raw = fs.readFileSync(path.join(dir, entry.name), "utf-8");
      const parsed = matter(raw);
      const content = parsed.content;
      const frontmatter = (Object.keys(parsed.data).length > 0 ? parsed.data : null) as DocFrontmatter | null;
      rootFiles.push({
        slug: fileSlug,
        title: fileTitle,
        order: fileOrder,
        content,
        segments: [fileSlug],
        frontmatter,
      });
    }
  }

  rootFiles.sort((a, b) => a.order - b.order);
  sections.sort((a, b) => a.order - b.order);

  // Wrap root files as single-file sections so they appear as direct links
  const rootSections: DocSection[] = rootFiles.map((f) => ({
    slug: f.slug,
    title: f.title,
    order: f.order,
    files: [f],
    children: [],
    segments: [f.slug],
  }));

  return [...rootSections, ...sections];
}

// ─── Brand System API ────────────────────────────────────

let _cache: DocSection[] | null = null;

export function getSections(): DocSection[] {
  if (_cache) return _cache;
  _cache = scanContentDir(BRAND_SYSTEM_DIR);
  return _cache;
}

export function getDocBySegments(
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  return resolveSegments(getSections(), segments);
}

export function getAllDocSegments(): string[][] {
  return flattenSegments(getSections());
}

export function getFirstDocSegments(): string[] | null {
  const sections = getSections();
  if (sections.length === 0 || sections[0].files.length === 0) return null;
  return sections[0].files[0].segments;
}

export function getAllDocsFlat(): DocFile[] {
  return flattenFiles(getSections());
}

// ─── Estúdio Criativo API ────────────────────────────────

let _estudioCache: DocSection[] | null = null;

export function getEstudioSections(): DocSection[] {
  if (_estudioCache) return _estudioCache;
  _estudioCache = scanContentDir(ESTUDIO_DIR);
  return _estudioCache;
}

export function getEstudioDocBySegments(
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  return resolveSegments(getEstudioSections(), segments);
}

export function getAllEstudioSegments(): string[][] {
  return flattenSegments(getEstudioSections());
}

export function getFirstEstudioSegments(): string[] | null {
  const sections = getEstudioSections();
  if (sections.length === 0 || sections[0].files.length === 0) return null;
  return sections[0].files[0].segments;
}

export function getAllEstudioFlat(): DocFile[] {
  return flattenFiles(getEstudioSections());
}

// ─── Growth System API ───────────────────────────────────

let _growthCache: DocSection[] | null = null;

export function getGrowthSections(): DocSection[] {
  if (_growthCache) return _growthCache;
  _growthCache = scanContentDir(GROWTH_DIR);
  return _growthCache;
}

export function getGrowthDocBySegments(
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  return resolveSegments(getGrowthSections(), segments);
}

export function getAllGrowthSegments(): string[][] {
  return flattenSegments(getGrowthSections());
}

export function getFirstGrowthSegments(): string[] | null {
  const sections = getGrowthSections();
  if (sections.length === 0 || sections[0].files.length === 0) return null;
  return sections[0].files[0].segments;
}

export function getAllGrowthFlat(): DocFile[] {
  return flattenFiles(getGrowthSections());
}

// ─── Pacote Cultural API ─────────────────────────────────

let _pacoteCache: DocSection[] | null = null;

export function getPacoteSections(): DocSection[] {
  if (_pacoteCache) return _pacoteCache;
  _pacoteCache = scanFlatContentDir(PACOTE_DIR);
  return _pacoteCache;
}

export function getPacoteDocBySegments(
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  if (segments.length === 1) {
    // Flat structure: section slug === file slug
    const section = getPacoteSections().find((s) => s.slug === segments[0]);
    if (!section || section.files.length === 0) return null;
    return { file: section.files[0], section, breadcrumbs: [section] };
  }
  return resolveSegments(getPacoteSections(), segments);
}

export function getAllPacoteSegments(): string[][] {
  return flattenSegments(getPacoteSections());
}

export function getFirstPacoteSegments(): string[] | null {
  const sections = getPacoteSections();
  if (sections.length === 0 || sections[0].files.length === 0) return null;
  return sections[0].files[0].segments;
}

export function getAllPacoteFlat(): DocFile[] {
  return flattenFiles(getPacoteSections());
}

// ─── Playbook de Conteúdo API ─────────────────────────────

let _playbookConteudoCache: DocSection[] | null = null;

export function getPlaybookConteudoSections(): DocSection[] {
  if (_playbookConteudoCache) return _playbookConteudoCache;
  _playbookConteudoCache = scanPlaybookDir(PLAYBOOK_CONTEUDO_DIR);
  return _playbookConteudoCache;
}

export function getPlaybookConteudoDocBySegments(
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  if (segments.length === 1) {
    const section = getPlaybookConteudoSections().find((s) => s.slug === segments[0]);
    if (!section || section.files.length === 0) return null;
    return { file: section.files[0], section, breadcrumbs: [section] };
  }
  return resolveSegments(getPlaybookConteudoSections(), segments);
}

export function getAllPlaybookConteudoSegments(): string[][] {
  return flattenSegments(getPlaybookConteudoSections());
}

export function getFirstPlaybookConteudoSegments(): string[] | null {
  const sections = getPlaybookConteudoSections();
  if (sections.length === 0 || sections[0].files.length === 0) return null;
  return sections[0].files[0].segments;
}

export function getAllPlaybookConteudoFlat(): DocFile[] {
  return flattenFiles(getPlaybookConteudoSections());
}

// ─── Playbook de Edição de Vídeos API ────────────────────

let _playbookVideosCache: DocSection[] | null = null;

export function getPlaybookVideosSections(): DocSection[] {
  if (_playbookVideosCache) return _playbookVideosCache;
  _playbookVideosCache = scanPlaybookDir(PLAYBOOK_VIDEOS_DIR);
  return _playbookVideosCache;
}

export function getPlaybookVideosDocBySegments(
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  if (segments.length === 1) {
    const section = getPlaybookVideosSections().find((s) => s.slug === segments[0]);
    if (!section || section.files.length === 0) return null;
    return { file: section.files[0], section, breadcrumbs: [section] };
  }
  return resolveSegments(getPlaybookVideosSections(), segments);
}

export function getAllPlaybookVideosSegments(): string[][] {
  return flattenSegments(getPlaybookVideosSections());
}

export function getFirstPlaybookVideosSegments(): string[] | null {
  const sections = getPlaybookVideosSections();
  if (sections.length === 0 || sections[0].files.length === 0) return null;
  return sections[0].files[0].segments;
}

export function getAllPlaybookVideosFlat(): DocFile[] {
  return flattenFiles(getPlaybookVideosSections());
}

// ─── Shared helpers ──────────────────────────────────────

function resolveSegments(
  sections: DocSection[],
  segments: string[]
): { file: DocFile; section: DocSection; breadcrumbs: DocSection[] } | null {
  if (segments.length < 2) return null;

  const fileSlug = segments[segments.length - 1];
  const sectionSlugs = segments.slice(0, -1);

  let pool: DocSection[] = sections;
  const breadcrumbs: DocSection[] = [];

  for (const slug of sectionSlugs) {
    const found = pool.find((s) => s.slug === slug);
    if (!found) return null;
    breadcrumbs.push(found);
    pool = found.children;
  }

  const section = breadcrumbs[breadcrumbs.length - 1];
  const file = section.files.find((f) => f.slug === fileSlug);
  if (!file) return null;

  return { file, section, breadcrumbs };
}

function flattenSegments(sections: DocSection[]): string[][] {
  const result: string[][] = [];
  function walk(s: DocSection[]) {
    for (const section of s) {
      for (const file of section.files) result.push(file.segments);
      walk(section.children);
    }
  }
  walk(sections);
  return result;
}

function flattenFiles(sections: DocSection[]): DocFile[] {
  const result: DocFile[] = [];
  function walk(s: DocSection[]) {
    for (const section of s) {
      result.push(...section.files);
      walk(section.children);
    }
  }
  walk(sections);
  return result;
}
