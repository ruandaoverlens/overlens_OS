import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGrowthDocBySegments,
  getAllGrowthSegments,
  getAllGrowthFlat,
} from "@/lib/docs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { DocPageView } from "@/components/doc-page-view";
import { resolveDocContent, docPathKey, resolveDocTitle } from "@/lib/doc-overrides";
import { DocPagination } from "@/components/doc-pagination";

export function generateStaticParams() {
  return getAllGrowthSegments().map((segments) => ({ slug: segments }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getGrowthDocBySegments(slug);
  return { title: result ? result.file.title : "Não encontrado" };
}

export default async function GrowthDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const result = getGrowthDocBySegments(slug);

  if (!result) notFound();

  const { file } = result;
  const { content, override } = await resolveDocContent("growth", file);
  const pageTitle = resolveDocTitle(file, override);

  const flat = getAllGrowthFlat();
  const idx = flat.findIndex(
    (f) => f.segments.join("/") === file.segments.join("/")
  );
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      <DocPageView
        system="growth"
        path={docPathKey(file.segments)}
        title={pageTitle}
        fileTitle={file.title}
        markdown={content}
        hasOverride={!!override}
      >
        <MarkdownRenderer content={content} title={pageTitle} />
      </DocPageView>
      <DocPagination prev={prev} next={next} basePath="/growth" />
    </div>
  );
}
