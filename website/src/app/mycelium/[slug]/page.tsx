import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMyceliumCategory, getAllMyceliumSlugs } from "@/lib/mycelium";
import { MyceliumCategoryPage } from "@/components/mycelium-category-page";
import { MediaCardGridSkeleton } from "@/components/skeletons";

export function generateStaticParams() {
  return getAllMyceliumSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getMyceliumCategory(slug);
  return { title: category ? category.title : "Página não encontrada" };
}

export default async function MyceliumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getMyceliumCategory(slug);

  if (!category) notFound();

  // As páginas leem filtros da URL (useSearchParams) — precisam de um limite
  // de Suspense para o prerender estático não falhar.
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-4 max-w-(--container-max-width) mx-auto w-full">
          <MediaCardGridSkeleton count={8} />
        </div>
      }
    >
      <MyceliumCategoryPage category={category} />
    </Suspense>
  );
}
