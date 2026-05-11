import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const folder = request.nextUrl.searchParams.get("folder");
    const bucket = request.nextUrl.searchParams.get("bucket") || "asset-previews";
    const fallbackBucket = request.nextUrl.searchParams.get("fallbackBucket");

    if (!folder) {
      return NextResponse.json({ error: "folder é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out folders (empty items) and .emptyFolderPlaceholder
    const primaryFiles = (data ?? [])
      .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder" && f.id)
      .map((f) => ({
        name: f.name,
        id: f.id,
        createdAt: f.created_at,
        size: f.metadata?.size ?? 0,
        mimetype: f.metadata?.mimetype ?? "",
        source: bucket,
      }));

    // If a fallback bucket is requested, also list it and merge any names that
    // are NOT already present in the primary bucket (matched by basename).
    let mergedFiles = primaryFiles;
    if (fallbackBucket && fallbackBucket !== bucket) {
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from(fallbackBucket)
        .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

      if (fallbackError) {
        console.warn(`[list] fallback bucket "${fallbackBucket}" failed: ${fallbackError.message}`);
      } else {
        const primaryBaseNames = new Set(
          primaryFiles.map((f) => f.name.replace(/\.[^.]+$/, "")),
        );

        const fallbackFiles = (fallbackData ?? [])
          .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder" && f.id)
          .filter((f) => !primaryBaseNames.has(f.name.replace(/\.[^.]+$/, "")))
          .map((f) => ({
            name: f.name,
            id: f.id,
            createdAt: f.created_at,
            size: f.metadata?.size ?? 0,
            mimetype: f.metadata?.mimetype ?? "",
            source: fallbackBucket,
          }));

        mergedFiles = [...primaryFiles, ...fallbackFiles];
      }
    }

    return NextResponse.json({ files: mergedFiles });
  } catch (err) {
    console.error("[list] Error:", err);
    return NextResponse.json(
      { error: "Erro ao listar assets" },
      { status: 500 },
    );
  }
}
