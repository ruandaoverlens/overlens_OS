/**
 * Migration script: uploads local media files from website/public/ to Supabase Storage buckets.
 *
 * Buckets:
 *   - platform-assets  (private, originals)
 *   - asset-previews   (public, previews)
 *
 * Usage:
 *   npx tsx scripts/migrate-assets-to-storage.ts
 *   npx tsx scripts/migrate-assets-to-storage.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONCURRENCY = 5;

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

interface MigrationGroup {
  label: string;
  sourceDir: string;
  /** Glob-style extensions to include (lowercase, with dot). Empty = all files. */
  extensions: string[];
  /** Path prefix inside each bucket (no leading/trailing slash). */
  bucketPath: string;
}

const GROUPS: MigrationGroup[] = [
  {
    label: "Footage previews",
    sourceDir: path.resolve(__dirname, "../public/footages/preview"),
    extensions: [".mp4"],
    bucketPath: "Footages",
  },
  {
    label: "Music files",
    sourceDir: path.resolve(__dirname, "../public/musicas"),
    extensions: [".mp3"],
    bucketPath: "Musicas",
  },
  {
    label: "Brand images",
    sourceDir: path.resolve(__dirname, "../public/brand/images"),
    extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    bucketPath: "Imagens",
  },
];

const BUCKETS = ["asset-previews", "platform-assets"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

function listFiles(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => {
      // Skip non-file entries (e.g. Links.txt or directories)
      const fullPath = path.join(dir, f);
      if (!fs.statSync(fullPath).isFile()) return false;
      const ext = path.extname(f).toLowerCase();
      if (extensions.length === 0) return true;
      return extensions.includes(ext);
    })
    .sort();
}

/**
 * Sanitize a filename for Supabase Storage.
 * Replaces brackets and other characters that Supabase rejects.
 */
function sanitizeStoragePath(name: string): string {
  return name
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[#%{}|\\^~`]/g, "_");
}

/** Run an array of async tasks with a concurrency limit. */
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
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Load environment variables from website/.env.local
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

  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const group of GROUPS) {
    const files = listFiles(group.sourceDir, group.extensions);
    console.log(`\n--- ${group.label} (${files.length} files) ---`);

    if (files.length === 0) {
      console.log("  No files found, skipping.");
      continue;
    }

    if (dryRun) {
      for (const file of files) {
        const storagePath = `${group.bucketPath}/${sanitizeStoragePath(file)}`;
        const contentType = detectContentType(file);
        console.log(
          `  [DRY] ${file} -> ${storagePath}  (${contentType})  => buckets: ${BUCKETS.join(", ")}`
        );
      }
      continue;
    }

    let completed = 0;

    const tasks = files.flatMap((file) => {
      const localPath = path.join(group.sourceDir, file);
      const storagePath = `${group.bucketPath}/${sanitizeStoragePath(file)}`;
      const contentType = detectContentType(file);

      return BUCKETS.map((bucket) => {
        return async () => {
          const fileBuffer = fs.readFileSync(localPath);
          const { error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, fileBuffer, {
              contentType,
              upsert: true,
            });

          if (error) {
            console.error(`  [ERROR] ${bucket}/${storagePath}: ${error.message}`);
            totalErrors++;
          } else {
            totalUploaded++;
          }

          // Increment progress per file (not per bucket upload)
          completed++;
          const fileProgress = Math.ceil(completed / BUCKETS.length);
          process.stdout.write(
            `\r  Progress: ${fileProgress}/${files.length} files`
          );
        };
      });
    });

    await runWithConcurrency(tasks, CONCURRENCY);
    console.log(); // newline after progress
  }

  console.log("\n=== Migration complete ===");
  console.log(`  Uploaded : ${totalUploaded}`);
  console.log(`  Errors   : ${totalErrors}`);
  if (dryRun) {
    console.log("  (dry run — no actual uploads were made)");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
