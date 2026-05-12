import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { ASSET_TYPE_FOLDERS, sanitizeStorageFilename } from "@/lib/supabase/storage";
import { createNotification } from "@/lib/notifications";

export const maxDuration = 60;

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

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

    if (!profile || !["staff", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const formData = await request.formData();
    const url = (formData.get("url") as string | null)?.trim();
    const assetType = formData.get("assetType") as string | null;
    const metadataRaw = formData.get("metadata") as string | null;
    const thumbnail = formData.get("thumbnail") as File | null;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }
    if (!assetType) {
      return NextResponse.json({ error: "Tipo de asset não especificado" }, { status: 400 });
    }

    let metadata: Record<string, unknown> = {};
    if (metadataRaw) {
      try { metadata = JSON.parse(metadataRaw); } catch { /* ignore */ }
    }

    // Synthetic storage path — links don't live in storage, but the table uses
    // storage_path as primary key, so we generate a stable unique id.
    const linkId = crypto.randomUUID();
    const folder = ASSET_TYPE_FOLDERS[assetType] ?? assetType;
    const storagePath = `${folder}/_links/${linkId}`;

    // Optional thumbnail upload to asset-previews
    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail.size > 0) {
      try {
        const ext = path.extname(thumbnail.name).toLowerCase() || ".png";
        const safeExt = sanitizeStorageFilename(ext);
        const thumbStoragePath = `${folder}/_links/${linkId}${safeExt}`;
        const buffer = Buffer.from(await thumbnail.arrayBuffer());

        const { error: thumbErr } = await supabase.storage
          .from("asset-previews")
          .upload(thumbStoragePath, buffer, {
            contentType: thumbnail.type || "image/png",
            upsert: true,
          });

        if (!thumbErr) {
          const { data: { publicUrl } } = supabase.storage
            .from("asset-previews")
            .getPublicUrl(thumbStoragePath);
          thumbnailUrl = publicUrl;
        }
      } catch (err) {
        console.error("[upload-link] Thumbnail upload failed:", err);
      }
    }

    const linkMetadata = {
      ...metadata,
      kind: "link" as const,
      url,
      thumbnailUrl,
    };

    const { error: insertError } = await supabase
      .from("content_items")
      .insert({
        storage_path: storagePath,
        asset_type: assetType,
        kind: "link",
        metadata: linkMetadata,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Persist a "reference saved" notification. createNotification logs and
    // returns null on failure, so it can't break the response.
    await createNotification({
      userId: user.id,
      variant: "post",
      category: "reference",
      title: "Referência salva",
      description: url,
      actionUrl: `/assets/${assetType}`,
      entityType: "reference",
      entityId: linkId,
      metadata: { url, assetType },
    });

    return NextResponse.json({
      success: true,
      link: {
        id: linkId,
        storagePath,
        url,
        thumbnailUrl,
        metadata: linkMetadata,
      },
    });
  } catch (err) {
    console.error("[upload-link] Error:", err);
    return NextResponse.json(
      { error: "Erro ao salvar link" },
      { status: 500 },
    );
  }
}
