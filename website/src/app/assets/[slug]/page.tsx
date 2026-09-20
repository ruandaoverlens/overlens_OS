import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssetCategory, getAllAssetSlugs } from "@/lib/assets";
import { AssetCategoryPage } from "@/components/asset-category-page";

export function generateStaticParams() {
  return getAllAssetSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getAssetCategory(slug);
  return { title: category ? category.title : "Página não encontrada" };
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getAssetCategory(slug);

  if (!category) notFound();

  return <AssetCategoryPage category={category} />;
}
