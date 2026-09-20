import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductDocBySegments,
  getAllProductSegments,
  getAllProductFlat,
} from "@/lib/docs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DocPageView } from "@/components/doc-page-view";
import { resolveDocContent, docPathKey } from "@/lib/doc-overrides";
import { DocPagination } from "@/components/doc-pagination";

export function generateStaticParams() {
  return getAllProductSegments().map((segments) => ({ slug: segments }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getProductDocBySegments(slug);
  return { title: result ? result.file.title : "Não encontrado" };
}

export default async function ProductDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const result = getProductDocBySegments(slug);

  if (!result) notFound();

  const { file } = result;
  const { content, override } = await resolveDocContent("product", file);

  const flat = getAllProductFlat();
  const idx = flat.findIndex(
    (f) => f.segments.join("/") === file.segments.join("/")
  );
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      <DocPageView
        system="product"
        path={docPathKey(file.segments)}
        markdown={content}
        hasOverride={!!override}
      >
        <MarkdownRenderer content={content} title={file.title} />
      </DocPageView>
      <DocPagination prev={prev} next={next} basePath="/product" />
    </div>
  );
}
