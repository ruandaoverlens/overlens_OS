/**
 * Scans `platform-assets/<folder>/` for image originals that have no matching
 * preview in `asset-previews/<folder>/` and generates+uploads the missing ones.
 *
 * Usage:
 *   infisical run --env=dev -- npx tsx scripts/fix-missing-previews.ts
 *   infisical run --env=dev -- npx tsx scripts/fix-missing-previews.ts --folder=Imagens
 *   infisical run --env=dev -- npx tsx scripts/fix-missing-previews.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import path from "node:path";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tiff", ".tif", ".bmp"]);
const PREVIEW_FORMAT = "webp" as const;
const PREVIEW_QUALITY = 75;
const PREVIEW_MAX = 1200;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const folderArg = process.argv.find((a) => a.startsWith("--folder="));
const folders = folderArg
  ? [folderArg.split("=")[1]]
  : ["Imagens", "Imagens/logos", "Imagens/cores", "Imagens/tipografia", "Imagens/icones", "Imagens/grafismos", "Imagens/templates"];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let totalMissing = 0;
  let totalFixed = 0;
  let totalFailed = 0;

  for (const folder of folders) {
    const { data: originals, error: origErr } = await supabase.storage
      .from("platform-assets")
      .list(folder, { limit: 1000 });
    if (origErr) {
      console.warn(`[${folder}] list platform-assets failed: ${origErr.message}`);
      continue;
    }

    const { data: previews, error: prevErr } = await supabase.storage
      .from("asset-previews")
      .list(folder, { limit: 1000 });
    if (prevErr) {
      console.warn(`[${folder}] list asset-previews failed: ${prevErr.message}`);
      continue;
    }

    const previewBaseNames = new Set(
      (previews ?? [])
        .filter((p) => p.name && p.id)
        .map((p) => p.name.replace(/\.[^.]+$/, "")),
    );

    const orphans = (originals ?? []).filter((o) => {
      if (!o.name || !o.id) return false;
      const ext = path.extname(o.name).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) return false;
      const base = o.name.replace(/\.[^.]+$/, "");
      return !previewBaseNames.has(base);
    });

    if (orphans.length === 0) {
      console.log(`[${folder}] all originals have previews ✓`);
      continue;
    }

    console.log(`[${folder}] ${orphans.length} image(s) missing preview:`);
    for (const o of orphans) console.log(`  - ${o.name}`);
    totalMissing += orphans.length;

    if (dryRun) continue;

    for (const o of orphans) {
      const originalPath = `${folder}/${o.name}`;
      const base = o.name.replace(/\.[^.]+$/, "");
      const previewPath = `${folder}/${base}.${PREVIEW_FORMAT}`;
      try {
        const { data: blob, error: dlErr } = await supabase.storage
          .from("platform-assets")
          .download(originalPath);
        if (dlErr || !blob) throw new Error(dlErr?.message ?? "download returned null");

        const inputBuffer = Buffer.from(await blob.arrayBuffer());
        const previewBuffer = await sharp(inputBuffer)
          .resize(PREVIEW_MAX, PREVIEW_MAX, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: PREVIEW_QUALITY })
          .toBuffer();

        const { error: upErr } = await supabase.storage
          .from("asset-previews")
          .upload(previewPath, previewBuffer, {
            contentType: "image/webp",
            upsert: true,
          });
        if (upErr) throw new Error(upErr.message);

        const ratio = previewBuffer.length / inputBuffer.length;
        console.log(
          `  ✓ ${previewPath} ${(inputBuffer.length / 1024).toFixed(0)} KB → ${(previewBuffer.length / 1024).toFixed(0)} KB (${Math.round((1 - ratio) * 100)}% smaller)`,
        );
        totalFixed++;
      } catch (err) {
        console.error(`  ✗ ${originalPath}: ${(err as Error).message}`);
        totalFailed++;
      }
    }
  }

  console.log(`\nSummary: ${totalMissing} missing, ${totalFixed} fixed, ${totalFailed} failed${dryRun ? " (dry-run)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
