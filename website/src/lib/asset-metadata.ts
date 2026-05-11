"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface AssetMetadataOverride {
  title: string | null;
  caption: string | null;
  author: string | null;
  year: string | null;
  source_url: string | null;
  tags: string[];
}

interface AssetMetadataRow extends AssetMetadataOverride {
  asset_type: string;
  asset_key: string;
  updated_at: string;
}

export interface AssetMetadataInput {
  title?: string | null;
  caption?: string | null;
  author?: string | null;
  year?: string | null;
  sourceUrl?: string | null;
  tags?: string[];
}

/**
 * Hook that loads admin-edited metadata overrides for an asset_type and exposes
 * helpers to look up, save, remove, and (for images) rename individual assets.
 *
 * Overrides are merged on top of the static defaults (IMAGE_METADATA / footages /
 * tracks) in each bank component.
 */
export function useAssetMetadata(assetType: string) {
  const [rows, setRows] = useState<Record<string, AssetMetadataOverride>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets/metadata?type=${encodeURIComponent(assetType)}`);
      if (!res.ok) return;
      const { metadata } = (await res.json()) as { metadata: AssetMetadataRow[] };
      const map: Record<string, AssetMetadataOverride> = {};
      for (const m of metadata) {
        map[m.asset_key] = {
          title: m.title,
          caption: m.caption,
          author: m.author,
          year: m.year,
          source_url: m.source_url,
          tags: m.tags ?? [],
        };
      }
      setRows(map);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [assetType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const get = useCallback(
    (assetKey: string): AssetMetadataOverride | undefined => rows[assetKey],
    [rows],
  );

  const save = useCallback(
    async (assetKey: string, input: AssetMetadataInput): Promise<{ ok: true } | { ok: false; error: string }> => {
      const res = await fetch("/api/assets/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, assetKey, ...input }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: data.error ?? "Erro ao salvar" };
      }
      setRows((prev) => ({
        ...prev,
        [assetKey]: {
          title: input.title ?? null,
          caption: input.caption ?? null,
          author: input.author ?? null,
          year: input.year ?? null,
          source_url: input.sourceUrl ?? null,
          tags: input.tags ?? [],
        },
      }));
      return { ok: true };
    },
    [assetType],
  );

  const remove = useCallback(
    async (assetKey: string) => {
      const res = await fetch("/api/assets/metadata", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, assetKey }),
      });
      if (res.ok) {
        setRows((prev) => {
          const next = { ...prev };
          delete next[assetKey];
          return next;
        });
      }
      return res.ok;
    },
    [assetType],
  );

  const rename = useCallback(
    async (folder: string, oldFilename: string, newFilename: string): Promise<{ ok: true; newFilename: string } | { ok: false; error: string }> => {
      const res = await fetch("/api/assets/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, folder, oldFilename, newFilename }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Erro ao renomear" };
      }
      const finalName = (data.newFilename as string) ?? newFilename;
      setRows((prev) => {
        const next = { ...prev };
        const moved = next[oldFilename];
        if (moved) {
          next[finalName] = moved;
          delete next[oldFilename];
        }
        return next;
      });
      return { ok: true, newFilename: finalName };
    },
    [assetType],
  );

  return useMemo(
    () => ({ rows, loading, get, save, remove, rename, refresh }),
    [rows, loading, get, save, remove, rename, refresh],
  );
}
