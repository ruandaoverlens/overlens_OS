import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDocBySegments,
  getAllDocSegments,
  getAllDocsFlat,
} from "@/lib/docs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DocPageView } from "@/components/doc-page-view";
import { resolveDocContent, docPathKey, resolveDocTitle } from "@/lib/doc-overrides";
import { DocPagination } from "@/components/doc-pagination";

export function generateStaticParams() {
  return getAllDocSegments().map((segments) => ({ slug: segments }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getDocBySegments(slug);
  return { title: result ? result.file.title : "Não encontrado" };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const result = getDocBySegments(slug);

  if (!result) notFound();

  const { file } = result;
  const { content, override } = await resolveDocContent("docs", file);
  const pageTitle = resolveDocTitle(file, override);

  // prev / next
  const flat = getAllDocsFlat();
  const idx = flat.findIndex(
    (f) => f.segments.join("/") === file.segments.join("/")
  );
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      <DocPageView
        system="docs"
        path={docPathKey(file.segments)}
        title={pageTitle}
        fileTitle={file.title}
        markdown={content}
        hasOverride={!!override}
      >
        <MarkdownRenderer content={content} title={pageTitle} />
      </DocPageView>
      <DocPagination prev={prev} next={next} />
    </div>
  );
}
