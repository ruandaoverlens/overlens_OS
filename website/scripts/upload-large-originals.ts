/**
 * Upload large original footage files (>50MB) to platform-assets via TUS resumable upload.
 * Forces upsert to replace preview versions with full-quality originals.
 *
 * Usage:
 *   npx tsx scripts/upload-large-originals.ts
 *   npx tsx scripts/upload-large-originals.ts --dry-run
 */

import * as tus from "tus-js-client";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TUS_THRESHOLD = 50 * 1024 * 1024; // 50 MB
const BUCKET = "platform-assets";
const BUCKET_PATH = "Footages";
const SOURCE_DIR = path.resolve(__dirname, "../../assets/Footages");

function sanitizeStoragePath(name: string): string {
  return name
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[#%{}|\\^~`]/g, "_")
    .replace(/\u00d7/g, "x")
    .replace(/\u2194/g, "-")
    .replace(/&/g, "e")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "_");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function tusUpload(
  filePath: string,
  objectPath: string,
  contentType: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    const projectId = new URL(supabaseUrl).hostname.split(".")[0];
    const endpoint = `https://${projectId}.supabase.co/storage/v1/upload/resumable`;

    const upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${serviceRoleKey}`,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: BUCKET,
        objectName: objectPath,
        contentType,
        cacheControl: "3600",
      },
      uploadSize: fileSize,
      chunkSize: 6 * 1024 * 1024, // 6 MB chunks
      onError(error: Error) {
        reject(error);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        const pct = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
        process.stdout.write(
          `\r    ${formatBytes(bytesUploaded)} / ${formatBytes(bytesTotal)} (${pct}%)  `
        );
      },
      onSuccess() {
        process.stdout.write("\n");
        resolve();
      },
    });

    upload.findPreviousUploads().then((prev: tus.PreviousUpload[]) => {
      if (prev.length) upload.resumeFrom(prev[0]);
      upload.start();
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const envPath = path.resolve(__dirname, "../.env.local");
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing env vars in", envPath);
    process.exit(1);
  }

  // List all MP4s >50MB
  const allFiles = fs.readdirSync(SOURCE_DIR).filter((f) => {
    const fullPath = path.join(SOURCE_DIR, f);
    if (!fs.statSync(fullPath).isFile()) return false;
    if (!f.toLowerCase().endsWith(".mp4")) return false;
    return fs.statSync(fullPath).size > TUS_THRESHOLD;
  });

  console.log(`Found ${allFiles.length} files >50MB to upload via TUS\n`);

  if (dryRun) {
    let totalSize = 0;
    for (const f of allFiles) {
      const size = fs.statSync(path.join(SOURCE_DIR, f)).size;
      totalSize += size;
      const storagePath = `${BUCKET_PATH}/${sanitizeStoragePath(f)}`;
      console.log(`  [DRY] ${f} (${formatBytes(size)}) -> ${storagePath}`);
    }
    console.log(`\nTotal: ${formatBytes(totalSize)}`);
    return;
  }

  let uploaded = 0;
  let errors = 0;
  let totalBytes = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const f = allFiles[i];
    const fullPath = path.join(SOURCE_DIR, f);
    const size = fs.statSync(fullPath).size;
    const storagePath = `${BUCKET_PATH}/${sanitizeStoragePath(f)}`;

    console.log(
      `[${i + 1}/${allFiles.length}] ${f} (${formatBytes(size)}) -> ${storagePath}`
    );

    try {
      await tusUpload(fullPath, storagePath, "video/mp4", supabaseUrl, serviceRoleKey);
      uploaded++;
      totalBytes += size;
    } catch (err) {
      errors++;
      console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Uploaded: ${uploaded} files (${formatBytes(totalBytes)})`);
  console.log(`  Errors:   ${errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
