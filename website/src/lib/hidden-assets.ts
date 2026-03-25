"use client";

import { useState, useEffect, useCallback } from "react";

interface HiddenEntry {
  asset_key: string;
  asset_type: string;
}

/**
 * Hook to manage hidden assets for a given asset type.
 * Fetches hidden keys on mount and provides hide/unhide + filter helpers.
 */
export function useHiddenAssets(assetType: string) {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchHidden = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets/hide?type=${encodeURIComponent(assetType)}`);
      if (!res.ok) return;
      const { hidden } = (await res.json()) as { hidden: HiddenEntry[] };
      setHiddenKeys(new Set(hidden.map((h) => h.asset_key)));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [assetType]);

  useEffect(() => {
    fetchHidden();
  }, [fetchHidden]);

  const hide = useCallback(
    async (assetKey: string) => {
      const res = await fetch("/api/assets/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetKey, assetType }),
      });
      if (res.ok) {
        setHiddenKeys((prev) => new Set(prev).add(assetKey));
      }
      return res.ok;
    },
    [assetType],
  );

  const unhide = useCallback(
    async (assetKey: string) => {
      const res = await fetch("/api/assets/hide", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetKey, assetType }),
      });
      if (res.ok) {
        setHiddenKeys((prev) => {
          const next = new Set(prev);
          next.delete(assetKey);
          return next;
        });
      }
      return res.ok;
    },
    [assetType],
  );

  const isHidden = useCallback(
    (assetKey: string) => hiddenKeys.has(assetKey),
    [hiddenKeys],
  );

  return { hiddenKeys, loading, isHidden, hide, unhide, refresh: fetchHidden };
}
