import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Admin-only
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { storagePath, previewPath } = await request.json();

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ error: "storagePath é obrigatório" }, { status: 400 });
    }

    // Delete original from platform-assets (best effort — may not exist)
    await supabase.storage
      .from("platform-assets")
      .remove([storagePath])
      .catch(() => {});

    // Delete preview from asset-previews
    // Try the given path + webp variant (previews may have different extension)
    const previewPaths: string[] = [];
    if (previewPath && typeof previewPath === "string") {
      previewPaths.push(previewPath);
      // Also try .webp variant
      const dotIdx = previewPath.lastIndexOf(".");
      if (dotIdx > -1) {
        previewPaths.push(previewPath.substring(0, dotIdx) + ".webp");
      }
    }
    if (previewPaths.length > 0) {
      await supabase.storage
        .from("asset-previews")
        .remove(previewPaths)
        .catch(() => {});
    }

    // Remove persisted metadata rows (best effort). Two possible homes:
    //  - public.content_items (Content Bank: templates/docs/3d) keyed by storage_path
    //  - public.asset_metadata (media overrides) keyed by (asset_type, asset_key=filename)
    await supabase
      .from("content_items")
      .delete()
      .eq("storage_path", storagePath)
      .then(() => undefined, () => undefined);

    const segments = storagePath.split("/");
    const filename = segments[segments.length - 1] ?? "";
    const folder = segments[0] ?? "";
    const folderToType: Record<string, "image" | "video" | "audio"> = {
      Imagens: "image",
      Footages: "video",
      Musicas: "audio",
    };
    const canonicalType = folderToType[folder];
    if (canonicalType && filename) {
      await supabase
        .from("asset_metadata")
        .delete()
        .eq("asset_type", canonicalType)
        .eq("asset_key", filename)
        .then(() => undefined, () => undefined);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[delete] Error:", err);
    return NextResponse.json(
      { error: "Erro ao excluir asset" },
      { status: 500 },
    );
  }
}
