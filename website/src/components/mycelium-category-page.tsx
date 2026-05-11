"use client";

import type { MyceliumCategory } from "@/lib/mycelium";
import { MyceliumFeedPage } from "./mycelium-feed-page";
import { MyceliumFavoritesPage } from "./mycelium-favorites-page";
import { MyceliumListPage } from "./mycelium-list-page";

export function MyceliumCategoryPage({ category }: { category: MyceliumCategory }) {
  if (category.slug === "feed") return <MyceliumFeedPage />;
  if (category.slug === "favoritos") return <MyceliumFavoritesPage />;
  if (category.type) return <MyceliumListPage category={category} />;
  return null;
}
