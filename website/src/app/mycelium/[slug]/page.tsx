import { notFound } from "next/navigation";
import { getMyceliumCategory, getAllMyceliumSlugs } from "@/lib/mycelium";
import { MyceliumCategoryPage } from "@/components/mycelium-category-page";

export function generateStaticParams() {
  return getAllMyceliumSlugs().map((slug) => ({ slug }));
}

export default async function MyceliumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getMyceliumCategory(slug);

  if (!category) notFound();

  return <MyceliumCategoryPage category={category} />;
}
