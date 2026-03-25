/**
 * Migration script: uploads ORIGINAL (full-quality) media files from assets/ to
 * the `platform-assets` (private) Supabase Storage bucket.
 *
 * This is separate from the preview migration because originals are much larger
 * (~6.9 GB) and only go to the private bucket (for authenticated downloads).
 *
 * Usage:
 *   npx tsx scripts/migrate-originals-to-storage.ts
 *   npx tsx scripts/migrate-originals-to-storage.ts --dry-run
 *   npx tsx scripts/migrate-originals-to-storage.ts --retry-failed
 */

import { createClient } from "@supabase/supabase-js";
import * as tus from "tus-js-client";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Lower concurrency for large files to avoid memory pressure */
const CONCURRENCY = 3;

/** Files above this size use TUS resumable upload (50 MB) */
const TUS_THRESHOLD = 50 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

interface MigrationGroup {
  label: string;
  sourceDir: string;
  extensions: string[];
  bucketPath: string;
  recursive?: boolean;
}

const ASSETS_ROOT = path.resolve(__dirname, "../../assets");

const GROUPS: MigrationGroup[] = [
  {
    label: "Footage originals",
    sourceDir: path.join(ASSETS_ROOT, "Footages"),
    extensions: [".mp4", ".mov", ".avi"],
    bucketPath: "Footages",
    recursive: false, // skip preview/ subfolder
  },
  {
    label: "Music originals",
    sourceDir: path.join(ASSETS_ROOT, "Musicas"),
    extensions: [".mp3", ".wav", ".flac"],
    bucketPath: "Musicas",
  },
  {
    label: "Image originals",
    sourceDir: path.join(ASSETS_ROOT, "Imagens"),
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
    bucketPath: "Imagens",
    recursive: true,
  },
];

const BUCKET = "platform-assets";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

function sanitizeStoragePath(name: string): string {
  return name
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[#%{}|\\^~`]/g, "_")
    .replace(/\u00d7/g, "x")   // × → x
    .replace(/\u2194/g, "-")   // ↔ → -
    .replace(/&/g, "e")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip accent marks
    .replace(/[^\x20-\x7E]/g, "_");  // replace remaining non-ASCII
}

function listFiles(
  dir: string,
  extensions: string[],
  recursive = false
): { absPath: string; relativePath: string }[] {
  if (!fs.existsSync(dir)) return [];

  const results: { absPath: string; relativePath: string }[] = [];

  function walk(currentDir: string, relativePrefix: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativePrefix
        ? `${relativePrefix}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        // Skip the preview/ subfolder — those are already migrated
        if (entry.name === "preview" || entry.name === "_previews") continue;
        if (recursive) walk(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.length === 0 || extensions.includes(ext)) {
          results.push({ absPath: fullPath, relativePath: relPath });
        }
      }
    }
  }

  walk(dir, "");
  return results.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// TUS resumable upload for large files
// ---------------------------------------------------------------------------

function tusUpload(
  filePath: string,
  bucketName: string,
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
        bucketName,
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
          `\r    TUS upload: ${formatBytes(bytesUploaded)} / ${formatBytes(bytesTotal)} (${pct}%)  `
        );
      },
      onSuccess() {
        console.log(); // newline after progress
        resolve();
      },
    });

    upload.findPreviousUploads().then((previousUploads: tus.PreviousUpload[]) => {
      if (previousUploads.length) upload.resumeFrom(previousUploads[0]);
      upload.start();
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const retryFailed = process.argv.includes("--retry-failed");

  const envPath = path.resolve(__dirname, "../.env.local");
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in",
      envPath
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (dryRun) {
    console.log("=== DRY RUN — nothing will be uploaded ===\n");
  }
  if (retryFailed) {
    console.log("=== RETRY MODE — skipping files already in bucket ===\n");
  }

  let totalUploaded = 0;
  let totalErrors = 0;
  let totalSkipped = 0;
  let totalBytes = 0;

  for (const group of GROUPS) {
    const files = listFiles(group.sourceDir, group.extensions, group.recursive);
    console.log(`\n--- ${group.label} (${files.length} files) ---`);

    if (files.length === 0) {
      console.log("  No files found, skipping.");
      continue;
    }

    if (dryRun) {
      let groupBytes = 0;
      for (const file of files) {
        const storagePath = `${group.bucketPath}/${sanitizeStoragePath(file.relativePath)}`;
        const contentType = detectContentType(file.absPath);
        const size = fs.statSync(file.absPath).size;
        groupBytes += size;
        console.log(
          `  [DRY] ${file.relativePath} (${formatBytes(size)}) -> ${storagePath}  (${contentType})`
        );
      }
      console.log(`  Group total: ${formatBytes(groupBytes)}`);
      totalBytes += groupBytes;
      continue;
    }

    // In retry mode, list existing objects so we can skip them
    let existingPaths = new Set<string>();
    if (retryFailed) {
      // List all objects in this group's folder
      let offset = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(group.bucketPath, { limit: pageSize, offset });
        if (error || !data || data.length === 0) break;
        for (const item of data) {
          existingPaths.add(`${group.bucketPath}/${item.name}`);
        }
        if (data.length < pageSize) break;
        offset += pageSize;
      }
      // For recursive groups, also list subdirectories
      if (group.recursive) {
        const { data: folders } = await supabase.storage
          .from(BUCKET)
          .list(group.bucketPath, { limit: 1000 });
        if (folders) {
          for (const folder of folders) {
            if (!folder.id) {
              // It's a folder (no id means it's a virtual folder)
              let subOffset = 0;
              while (true) {
                const { data: subItems, error: subErr } = await supabase.storage
                  .from(BUCKET)
                  .list(`${group.bucketPath}/${folder.name}`, {
                    limit: pageSize,
                    offset: subOffset,
                  });
                if (subErr || !subItems || subItems.length === 0) break;
                for (const item of subItems) {
                  existingPaths.add(
                    `${group.bucketPath}/${folder.name}/${item.name}`
                  );
                }
                if (subItems.length < pageSize) break;
                subOffset += pageSize;
              }
            }
          }
        }
      }
      console.log(`  Found ${existingPaths.size} existing files in bucket.`);
    }

    let completed = 0;

    const tasks = files.map((file) => async () => {
      const storagePath = `${group.bucketPath}/${sanitizeStoragePath(file.relativePath)}`;
      const contentType = detectContentType(file.absPath);
      const size = fs.statSync(file.absPath).size;

      // In retry mode, skip files already uploaded
      if (retryFailed && existingPaths.has(storagePath)) {
        completed++;
        totalSkipped++;
        return;
      }

      if (size > TUS_THRESHOLD) {
        // Use TUS resumable upload for large files
        console.log(
          `\n  [TUS] ${file.relativePath} (${formatBytes(size)}) -> ${storagePath}`
        );
        try {
          await tusUpload(
            file.absPath,
            BUCKET,
            storagePath,
            contentType,
            supabaseUrl,
            serviceRoleKey
          );
          totalUploaded++;
          totalBytes += size;
          completed++;
        } catch (err: any) {
          totalErrors++;
          completed++;
          console.error(
            `  [ERROR] ${file.relativePath} (${formatBytes(size)}): ${err.message ?? err}`
          );
        }
      } else {
        // Standard upload for smaller files
        const fileBuffer = fs.readFileSync(file.absPath);

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, fileBuffer, {
            contentType,
            upsert: true,
          });

        completed++;

        if (error) {
          totalErrors++;
          console.error(
            `  [ERROR] ${file.relativePath} (${formatBytes(size)}): ${error.message}`
          );
        } else {
          totalUploaded++;
          totalBytes += size;
          process.stdout.write(
            `\r  Progress: ${completed}/${files.length} files  `
          );
        }
      }
    });

    await runWithConcurrency(tasks, CONCURRENCY);
    console.log(); // newline after progress
  }

  console.log(`\n=== Migration complete ===`);
  console.log(`  Uploaded : ${totalUploaded} files (${formatBytes(totalBytes)})`);
  console.log(`  Skipped  : ${totalSkipped} files (already in bucket)`);
  console.log(`  Errors   : ${totalErrors}`);
  if (dryRun) {
    console.log(`  Total size: ${formatBytes(totalBytes)}`);
    console.log(`  (dry run — no actual uploads were made)`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
