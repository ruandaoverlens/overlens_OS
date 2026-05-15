import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, rm, readFile } from "fs/promises";
import path from "path";
import os from "os";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFilename } from "@/lib/supabase/storage";
import {
  generatePreview,
  detectMediaType,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  AUDIO_EXTENSIONS,
} from "@/lib/media-optimizer";
import { fetchOgMetadata, downloadImage } from "@/lib/mycelium-og";
import type {
  AttachmentKind,
  MyceliumType,
} from "@/lib/mycelium-types";

export const maxDuration = 120;

const VALID_TYPES: ReadonlySet<MyceliumType> = new Set([
  "artigo",
  "video",
  "imagem",
  "audio",
  "pdf",
  "skill",
  "post",
  "site",
]);

interface PayloadShape {
  type?: string;
  title?: string;
  description?: string | null;
  url?: string | null;
  tags?: unknown;
}

function detectAttachmentKind(filename: string): AttachmentKind {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  return "file";
}

function pickContentType(file: File): string {
  return file.type && file.type.length > 0 ? file.type : "application/octet-stream";
}

/**
 * POST /api/mycelium/create
 *
 * Cria uma referência no Mycelium com cover (opcional) e N anexos.
 * Restrito a staff/admin.
 *
 * multipart/form-data:
 *   payload (string, JSON):
 *     {
 *       type: MyceliumType,
 *       title: string,
 *       description?: string,
 *       url?: string,
 *       tags?: string[],
 *     }
 *   cover (File, opcional)         — vai pra mycelium-previews/{id}/cover.{ext}
 *   attachments[] (File[], 0+)     — originais em mycelium-attachments/{id}/{i}-{name}
 *                                    previews de imagens em mycelium-previews/{id}/{i}-preview.webp
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth + role check (staff/admin) — espelha api/assets/upload/route.ts
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

    const form = await request.formData();
    const payloadRaw = form.get("payload");
    if (typeof payloadRaw !== "string" || !payloadRaw.trim()) {
      return NextResponse.json(
        { error: "payload é obrigatório (JSON string)" },
        { status: 400 },
      );
    }

    let payload: PayloadShape;
    try {
      payload = JSON.parse(payloadRaw) as PayloadShape;
    } catch {
      return NextResponse.json(
        { error: "payload não é JSON válido" },
        { status: 400 },
      );
    }

    const type = (payload.type ?? "").trim();
    const title = (payload.title ?? "").trim();
    const description = (payload.description ?? "")?.toString().trim() || null;
    const url = (payload.url ?? "")?.toString().trim() || null;
    const tags = Array.isArray(payload.tags)
      ? payload.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0).map((t) => t.trim())
      : [];

    if (!VALID_TYPES.has(type as MyceliumType)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }

    const cover = form.get("cover");
    const coverFile = cover instanceof File && cover.size > 0 ? cover : null;
    const attachments = form
      .getAll("attachments[]")
      .concat(form.getAll("attachments"))
      .filter((v): v is File => v instanceof File && v.size > 0);

    // 1) Insert da reference (sem cover_path ainda — depende do upload)
    const { data: insertedRef, error: insertError } = await supabase
      .from("mycelium_references")
      .insert({
        type,
        title,
        description,
        url,
        tags,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !insertedRef) {
      console.error("[mycelium:create] insert error:", insertError?.message);
      return NextResponse.json(
        { error: insertError?.message ?? "Erro ao criar referência" },
        { status: 500 },
      );
    }

    const refId = insertedRef.id as string;
    let coverPath: string | null = null;

    // 2) Upload da cover (best-effort — não derruba o create)
    if (coverFile) {
      try {
        const safeName = sanitizeFilename(coverFile.name) || "cover";
        const ext = path.extname(safeName).toLowerCase() || ".jpg";
        const coverStoragePath = `${refId}/cover${ext}`;
        const buf = Buffer.from(await coverFile.arrayBuffer());

        const { error: coverError } = await supabase.storage
          .from("mycelium-previews")
          .upload(coverStoragePath, buf, {
            contentType: pickContentType(coverFile),
            upsert: true,
          });

        if (coverError) {
          console.error("[mycelium:create] cover upload failed:", coverError.message);
        } else {
          coverPath = coverStoragePath;
          await supabase
            .from("mycelium_references")
            .update({ cover_path: coverPath })
            .eq("id", refId);
        }
      } catch (err) {
        console.error("[mycelium:create] cover unexpected error:", err);
      }
    }

    // 2b) Fallback: nenhuma cover enviada e tem URL → puxa OpenGraph image server-side.
    //     CORS no browser bloqueia o fetch durante o blur do form em muitos sites,
    //     então essa rota server-side é a garantia.
    if (!coverPath && url) {
      try {
        const og = await fetchOgMetadata(url);
        if (og.image) {
          const downloaded = await downloadImage(og.image);
          if (downloaded) {
            const coverStoragePath = `${refId}/cover${downloaded.ext}`;
            const { error: ogCoverError } = await supabase.storage
              .from("mycelium-previews")
              .upload(coverStoragePath, downloaded.buffer, {
                contentType: downloaded.contentType,
                upsert: true,
              });

            if (ogCoverError) {
              console.error(
                "[mycelium:create] OG cover upload failed:",
                ogCoverError.message,
              );
            } else {
              coverPath = coverStoragePath;
              await supabase
                .from("mycelium_references")
                .update({ cover_path: coverPath })
                .eq("id", refId);
            }
          }
        }
      } catch (err) {
        console.error("[mycelium:create] OG fallback failed:", err);
      }
    }

    // 3) Upload de cada attachment
    type AttachmentInsert = {
      reference_id: string;
      storage_path: string;
      preview_path: string | null;
      kind: AttachmentKind;
      mime_type: string | null;
      size_bytes: number;
      sort_order: number;
    };

    const attachmentRows: AttachmentInsert[] = [];

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      try {
        const safeName = sanitizeFilename(file.name) || `arquivo-${i}`;
        const storagePath = `${refId}/${i}-${safeName}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const kind = detectAttachmentKind(safeName);

        const { error: uploadError } = await supabase.storage
          .from("mycelium-attachments")
          .upload(storagePath, buffer, {
            contentType: pickContentType(file),
            upsert: false,
          });

        if (uploadError) {
          console.error(
            `[mycelium:create] attachment ${i} upload failed:`,
            uploadError.message,
          );
          continue;
        }

        // Gera preview apenas para imagens (server-side via sharp).
        // Best-effort: nunca derruba o create se preview falhar.
        let previewPath: string | null = null;
        if (kind === "image" && detectMediaType(safeName) === "image") {
          try {
            const tmpDir = path.join(os.tmpdir(), "overlens-mycelium-upload");
            await mkdir(tmpDir, { recursive: true });
            const tmpPath = path.join(tmpDir, `${refId}_${i}_${safeName}`);
            await writeFile(tmpPath, buffer);

            const result = await generatePreview(tmpPath, { force: true });
            const previewBuffer = await readFile(result.previewPath);
            const previewStoragePath = `${refId}/${i}-preview.webp`;

            const { error: previewError } = await supabase.storage
              .from("mycelium-previews")
              .upload(previewStoragePath, previewBuffer, {
                contentType: "image/webp",
                upsert: true,
              });

            if (previewError) {
              console.error(
                `[mycelium:create] preview ${i} upload failed:`,
                previewError.message,
              );
            } else {
              previewPath = previewStoragePath;
            }

            await rm(tmpPath, { force: true }).catch(() => {});
            await rm(result.previewPath, { force: true }).catch(() => {});
          } catch (err) {
            console.error(`[mycelium:create] preview ${i} generation failed:`, err);
          }
        }

        attachmentRows.push({
          reference_id: refId,
          storage_path: storagePath,
          preview_path: previewPath,
          kind,
          mime_type: file.type || null,
          size_bytes: buffer.length,
          sort_order: i,
        });
      } catch (err) {
        console.error(`[mycelium:create] attachment ${i} unexpected error:`, err);
      }
    }

    if (attachmentRows.length > 0) {
      const { error: rowsError } = await supabase
        .from("mycelium_attachments")
        .insert(attachmentRows);
      if (rowsError) {
        console.error(
          "[mycelium:create] attachment rows insert failed:",
          rowsError.message,
        );
      }
    }

    // 4) Re-fetch da referência completa (com attachments) pra retornar shape pronto.
    const { data: full, error: fetchError } = await supabase
      .from("mycelium_references")
      .select("*, attachments:mycelium_attachments(*)")
      .eq("id", refId)
      .single();

    if (fetchError) {
      console.error("[mycelium:create] re-fetch failed:", fetchError.message);
      return NextResponse.json({ id: refId, success: true });
    }

    return NextResponse.json({ reference: full, id: refId, success: true });
  } catch (err) {
    console.error("[mycelium:create] Error:", err);
    return NextResponse.json(
      { error: "Erro ao criar referência" },
      { status: 500 },
    );
  }
}
