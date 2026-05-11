import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { sanitizeStorageFilename } from "@/lib/supabase/storage";
import { createNotification } from "@/lib/notifications";

/**
 * POST /api/assets/rename
 * Body: { assetType: 'image'|'video'|'audio', folder: 'Imagens'|'Footages'|'Musicas', oldFilename, newFilename }
 *
 * Renames the original in `platform-assets/<folder>/` and all matching previews in
 * `asset-previews/<folder>/` (preview can have a different extension than the original,
 * e.g. .webp). Also rewrites the asset_metadata and hidden_assets rows so the references
 * keep pointing at the file.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await request.json() as {
      assetType?: string;
      folder?: string;
      oldFilename?: string;
      newFilename?: string;
    };

    const { assetType, folder, oldFilename, newFilename } = body;
    if (!assetType || !folder || !oldFilename || !newFilename) {
      return NextResponse.json(
        { error: "assetType, folder, oldFilename e newFilename são obrigatórios" },
        { status: 400 },
      );
    }

    const safeOld = sanitizeStorageFilename(oldFilename);
    const safeNew = sanitizeStorageFilename(newFilename);

    if (safeOld === safeNew) {
      return NextResponse.json({ success: true, newFilename: safeNew });
    }

    const oldBase = safeOld.replace(/\.[^.]+$/, "");
    const newBase = safeNew.replace(/\.[^.]+$/, "");
    const oldExt = path.extname(safeOld);
    const newExt = path.extname(safeNew);

    // Guard: the original file must keep its extension. Renaming just changes the basename.
    if (oldExt.toLowerCase() !== newExt.toLowerCase()) {
      return NextResponse.json(
        { error: `Mude apenas o nome, mantenha a extensão "${oldExt}"` },
        { status: 400 },
      );
    }

    const oldOriginalPath = `${folder}/${safeOld}`;
    const newOriginalPath = `${folder}/${safeNew}`;

    // Check the new path is free in platform-assets (avoid silent overwrite).
    const { data: existing } = await supabase.storage
      .from("platform-assets")
      .list(folder, { search: safeNew, limit: 1 });
    if (existing && existing.some((f) => f.name === safeNew)) {
      return NextResponse.json(
        { error: "Já existe um arquivo com esse nome" },
        { status: 409 },
      );
    }

    // Move the original in platform-assets.
    const { error: originalMoveErr } = await supabase.storage
      .from("platform-assets")
      .move(oldOriginalPath, newOriginalPath);
    if (originalMoveErr) {
      return NextResponse.json({ error: originalMoveErr.message }, { status: 500 });
    }

    // Move any preview files that share the basename in asset-previews.
    // Previews may have a different extension (e.g. image originals get a .webp preview).
    const previewFailures: Array<{ path: string; message: string }> = [];
    try {
      const { data: previews } = await supabase.storage
        .from("asset-previews")
        .list(folder, { limit: 1000 });

      const matches = (previews ?? []).filter((f) => {
        if (!f.name) return false;
        const base = f.name.replace(/\.[^.]+$/, "");
        return base === oldBase;
      });

      for (const match of matches) {
        const ext = path.extname(match.name);
        const oldPreviewPath = `${folder}/${match.name}`;
        const newPreviewPath = `${folder}/${newBase}${ext}`;
        const { error: moveErr } = await supabase.storage
          .from("asset-previews")
          .move(oldPreviewPath, newPreviewPath);
        if (moveErr) {
          console.warn("[rename] preview move failed", oldPreviewPath, moveErr);
          previewFailures.push({ path: oldPreviewPath, message: moveErr.message });
        }
      }
    } catch (err) {
      console.warn("[rename] preview enumeration failed", err);
      previewFailures.push({
        path: `${folder}/*`,
        message: err instanceof Error ? err.message : "preview enumeration failed",
      });
    }

    if (previewFailures.length > 0) {
      const firstMsg = previewFailures[0]?.message ?? "";
      await createNotification({
        userId: user.id,
        variant: "system",
        category: "asset",
        title: "Renomeação parcial",
        description: `O arquivo foi renomeado, mas o preview não foi movido. ${firstMsg}`.trim(),
        entityType: "asset",
        entityId: newOriginalPath,
        metadata: {
          issue: "preview-move-failed",
          failures: previewFailures,
        },
      });
    }

    // Update asset_metadata PK if a row exists for the old key.
    // PK is (asset_type, asset_key) so we have to delete-then-insert (or upsert).
    const { data: oldMeta } = await supabase
      .from("asset_metadata")
      .select("title, caption, author, year, source_url, tags")
      .eq("asset_type", assetType)
      .eq("asset_key", safeOld)
      .maybeSingle();

    if (oldMeta) {
      await supabase
        .from("asset_metadata")
        .delete()
        .eq("asset_type", assetType)
        .eq("asset_key", safeOld);

      await supabase.from("asset_metadata").upsert(
        {
          asset_type: assetType,
          asset_key: safeNew,
          title: oldMeta.title,
          caption: oldMeta.caption,
          author: oldMeta.author,
          year: oldMeta.year,
          source_url: oldMeta.source_url,
          tags: oldMeta.tags ?? [],
          updated_by: user.id,
        },
        { onConflict: "asset_type,asset_key" },
      );
    }

    // hidden_assets uses asset_key=filename for images. Rewrite if present.
    await supabase
      .from("hidden_assets")
      .update({ asset_key: safeNew })
      .eq("asset_type", assetType)
      .eq("asset_key", safeOld);

    return NextResponse.json({ success: true, newFilename: safeNew });
  } catch (err) {
    console.error("[rename] Error:", err);
    return NextResponse.json({ error: "Erro ao renomear asset" }, { status: 500 });
  }
}
