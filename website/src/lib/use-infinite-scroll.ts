"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const PAGE_SIZE = 50;

/**
 * Hook for paginating a list with infinite scroll.
 * Returns a sliced subset of `items` that grows as the user scrolls.
 * Attach `sentinelRef` to an element near the bottom of the scroll container.
 */
export function useInfiniteScroll<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset page when items change (e.g. filter/search). Adjust during render
  // (tracking the previous length) instead of a setState-in-effect.
  const itemsKey = items.length;
  const [prevItemsKey, setPrevItemsKey] = useState(itemsKey);
  if (prevItemsKey !== itemsKey) {
    setPrevItemsKey(itemsKey);
    setPage(1);
  }

  const visibleItems = useMemo(
    () => items.slice(0, page * pageSize),
    [items, page, pageSize],
  );

  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  // Intersection observer for the sentinel
  const setSentinel = useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      sentinelRef.current = node;

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "400px" },
      );

      observerRef.current.observe(node);
    },
    [loadMore],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { visibleItems, hasMore, setSentinel };
}
