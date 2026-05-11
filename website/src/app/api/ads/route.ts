import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, rm, readFile } from "fs/promises";
import path from "path";
import os from "os";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFilename } from "@/lib/supabase/storage";
import { generatePreview, detectMediaType } from "@/lib/media-optimizer";
import type { Ad, AdMedia, AdType } from "@/lib/ads";
import { createNotification } from "@/lib/notifications";

export const maxDuration = 300;

interface AdRow {
  id: string;
  type: string;
  title: string;
  platform: string | null;
  ctr: string | number | null;
  retention_seconds: string | number | null;
  retention_percent: string | number | null;
  conversion: string | number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface AdMediaRow {
  id: string;
  ad_id: string;
  sort_order: number;
  storage_path: string;
  preview_path: string | null;
  mime_type: string | null;
  filename: string | null;
}

function toNumber(v: string | number | null): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
}

function rowToAd(row: AdRow, media: AdMediaRow[]): Ad {
  return {
    id: row.id,
    type: row.type as AdType,
    title: row.title,
    platform: row.platform,
    ctr: toNumber(row.ctr),
    retention_seconds: toNumber(row.retention_seconds),
    retention_percent: toNumber(row.retention_percent),
    conversion: toNumber(row.conversion),
    notes: row.notes,
    tags: Array.isArray(row.tags) ? row.tags : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    media: media
      .filter((m) => m.ad_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(
        (m): AdMedia => ({
          id: m.id,
          ad_id: m.ad_id,
          sort_order: m.sort_order,
          storage_path: m.storage_path,
          preview_path: m.preview_path,
          mime_type: m.mime_type,
          filename: m.filename,
        }),
      ),
  };
}

/** GET — list every ad with its media. */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: ads, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (adsError) return NextResponse.json({ error: adsError.message }, { status: 500 });

    const adIds = (ads ?? []).map((a) => a.id);
    let media: AdMediaRow[] = [];
    if (adIds.length > 0) {
      const { data: mediaRows, error: mediaError } = await supabase
        .from("ad_media")
        .select("*")
        .in("ad_id", adIds);
      if (mediaError) return NextResponse.json({ error: mediaError.message }, { status: 500 });
      media = (mediaRows ?? []) as AdMediaRow[];
    }

    return NextResponse.json({
      ads: (ads ?? []).map((row) => rowToAd(row as AdRow, media)),
    });
  } catch (err) {
    console.error("[ads:list] Error:", err);
    return NextResponse.json({ error: "Erro ao listar anúncios" }, { status: 500 });
  }
}

/**
 * POST — create a new ad with N media files.
 *
 * multipart/form-data:
 *   type:       "image" | "video" | "carousel"
 *   title:      string
 *   platform?:  string
 *   ctr?:       number string
 *   retention_seconds?: number string
 *   retention_percent?: number string
 *   conversion?: number string
 *   notes?:     string
 *   tags?:      JSON-encoded string[]
 *   files:      File[] (1+ for carousel, 1 for image/video)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["staff", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const form = await request.formData();
    const type = (form.get("type") as string | null) ?? "";
    const title = (form.get("title") as string | null)?.trim() ?? "";
    const platform = (form.get("platform") as string | null) || null;
    const notes = (form.get("notes") as string | null) || null;
    const tagsRaw = form.get("tags") as string | null;

    const ctr = parseNumeric(form.get("ctr"));
    const retentionSec = parseNumeric(form.get("retention_seconds"));
    const retentionPct = parseNumeric(form.get("retention_percent"));
    const conversion = parseNumeric(form.get("conversion"));

    if (!["image", "video", "carousel"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }

    const files = form.getAll("files").filter((v): v is File => v instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }
    if (type === "image" && files.length !== 1) {
      return NextResponse.json({ error: "Anúncio de imagem precisa de exatamente 1 arquivo" }, { status: 400 });
    }
    if (type === "video" && files.length !== 1) {
      return NextResponse.json({ error: "Anúncio de vídeo precisa de exatamente 1 arquivo" }, { status: 400 });
    }
    if (type === "carousel" && files.length < 2) {
      return NextResponse.json({ error: "Carrossel precisa de pelo menos 2 imagens" }, { status: 400 });
    }

    let tags: string[] = [];
    if (tagsRaw) {
      try {
        const parsed = JSON.parse(tagsRaw);
        if (Array.isArray(parsed)) {
          tags = parsed.filter((t): t is string => typeof t === "string");
        }
      } catch { /* ignore */ }
    }

    // Insert ad row first so we get the ID for the storage prefix.
    const { data: insertedAd, error: insertError } = await supabase
      .from("ads")
      .insert({
        type,
        title,
        platform,
        ctr,
        retention_seconds: retentionSec,
        retention_percent: retentionPct,
        conversion,
        notes,
        tags,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (insertError || !insertedAd) {
      return NextResponse.json({ error: insertError?.message ?? "Erro ao criar anúncio" }, { status: 500 });
    }

    const adId = insertedAd.id as string;
    const mediaRows: Array<{
      ad_id: string;
      sort_order: number;
      storage_path: string;
      preview_path: string | null;
      mime_type: string | null;
      filename: string | null;
    }> = [];

    // Upload each file to platform-assets/Anuncios/{adId}/{sort}_{sanitized}.ext
    // Generate previews for images (server-side via sharp). Videos go raw — front-end
    // browser preview from the original is acceptable in this MVP.
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const safeName = sanitizeFilename(file.name);
      const storagePath = `Anuncios/${adId}/${i}_${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("platform-assets")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        console.error("[ads:create] Upload failed for", storagePath, uploadError.message);
        continue;
      }

      // Generate optimized preview for images.
      let previewPath: string | null = null;
      const mediaType = detectMediaType(safeName);
      if (mediaType === "image") {
        try {
          const tmpDir = path.join(os.tmpdir(), "overlens-ad-upload");
          await mkdir(tmpDir, { recursive: true });
          const tmpPath = path.join(tmpDir, `${adId}_${i}_${safeName}`);
          await writeFile(tmpPath, buffer);
          const result = await generatePreview(tmpPath, { force: true });
          const previewBuffer = await readFile(result.previewPath);
          const previewExt = path.extname(result.previewPath);
          const previewStorage = `Anuncios/${adId}/${i}_${path.parse(safeName).name}${previewExt}`;
          await supabase.storage
            .from("asset-previews")
            .upload(previewStorage, previewBuffer, {
              contentType: previewExt === ".webp" ? "image/webp" : "application/octet-stream",
              upsert: true,
            });
          previewPath = previewStorage;
          await rm(tmpPath, { force: true }).catch(() => {});
          await rm(result.previewPath, { force: true }).catch(() => {});
        } catch (err) {
          console.error("[ads:create] Preview generation failed:", err);
        }
      } else if (mediaType === "video") {
        // Upload original to asset-previews too (so it serves over the public bucket).
        const previewStorage = `Anuncios/${adId}/${i}_${safeName}`;
        const { error: previewUploadError } = await supabase.storage
          .from("asset-previews")
          .upload(previewStorage, buffer, {
            contentType: file.type || "video/mp4",
            upsert: true,
          });
        if (!previewUploadError) {
          previewPath = previewStorage;
        }
      }

      mediaRows.push({
        ad_id: adId,
        sort_order: i,
        storage_path: storagePath,
        preview_path: previewPath,
        mime_type: file.type || null,
        filename: safeName,
      });
    }

    if (mediaRows.length === 0) {
      // Rollback the ad row if nothing uploaded.
      await supabase.from("ads").delete().eq("id", adId);
      return NextResponse.json({ error: "Falha ao subir os arquivos" }, { status: 500 });
    }

    const { error: mediaInsertError } = await supabase
      .from("ad_media")
      .insert(mediaRows);

    if (mediaInsertError) {
      console.error("[ads:create] ad_media insert failed:", mediaInsertError.message);
    }

    await createNotification({
      userId: user.id,
      variant: "post",
      category: "asset",
      title: "Anúncio adicionado",
      description: platform ? `${title} · ${platform}` : title,
      actionUrl: "/assets/banco-de-anuncios",
      entityType: "ad",
      entityId: adId,
      metadata: { platform: platform ?? null },
    });

    return NextResponse.json({ id: adId, success: true });
  } catch (err) {
    console.error("[ads:create] Error:", err);
    return NextResponse.json({ error: "Erro ao criar anúncio" }, { status: 500 });
  }
}

function parseNumeric(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
