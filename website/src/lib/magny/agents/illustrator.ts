import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IllustratorInput {
  pipelineRunId: string;
  pipelineStepId: string;
}

export interface IllustratorOutput {
  coverImageUrl: string;
}

interface ReportRow {
  id: string;
  title: string;
  slug: string;
  metadata: Record<string, unknown>;
}

interface SectionRow {
  section_key: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Builds a visual prompt from the report headline + executive summary.
 * The prompt is crafted to produce abstract, editorial-style cover images
 * that align with Overlens' visual identity: dark backgrounds, geometric
 * compositions, micro-dose color accents.
 */
function buildImagePrompt(title: string, executiveSummary: string): string {
  // Extract the headline part after "ADS-XX/XX/XX: "
  const headline = title.replace(/^ADS-\d{2}\/\d{2}\/\d{2}:\s*/, "");

  // Take first 300 chars of executive summary for context
  const context = executiveSummary.slice(0, 300).replace(/\n/g, " ").trim();

  return [
    `Create an abstract, cinematic editorial cover image that visually represents the concept: "${headline}".`,
    `Context: ${context}`,
    "",
    "Visual style requirements:",
    "- Dark, moody background (deep black or very dark charcoal)",
    "- Abstract geometric composition with subtle depth and layering",
    "- Micro-dose color accents: ice blue (#7EC8E3), amber (#D4A853), or moss green (#5A8F5A)",
    "- Modern, minimalist, editorial aesthetic — like a premium tech magazine cover",
    "- No text, no logos, no human faces, no hands",
    "- Photographic quality with abstract/conceptual elements",
    "- Aspect ratio 16:9, cinematic composition",
    "- Inspired by the visual language of Kandinsky, El Lissitzky, and modernist design",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Google Imagen API (SeeDeam) via Generative AI API
// ---------------------------------------------------------------------------

async function generateImage(prompt: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
  }

  // Use Imagen 3 via the Generative Language API
  // SeeDeam model — falls back to imagen-3.0-generate-002 if seedream not available
  const model = process.env.IMAGEN_MODEL ?? "imagen-3.0-generate-002";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        personGeneration: "DONT_ALLOW",
        safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Imagen API error ${response.status}: ${response.statusText} — ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    predictions?: Array<{
      bytesBase64Encoded?: string;
      mimeType?: string;
    }>;
  };

  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) {
    throw new Error("Imagen API returned no image data");
  }

  return Buffer.from(base64, "base64");
}

// ---------------------------------------------------------------------------
// Upload to Supabase Storage
// ---------------------------------------------------------------------------

async function uploadCoverImage(
  imageBuffer: Buffer,
  slug: string
): Promise<string> {
  const supabase = createAdminClient();
  const bucket = "magny-covers";
  const filePath = `${slug}.webp`;

  // Ensure bucket exists (idempotent — will 409 if already exists)
  await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/webp", "image/png", "image/jpeg"],
  });

  // Upload (upsert to overwrite on re-runs)
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, imageBuffer, {
      contentType: "image/png", // Imagen returns PNG
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload cover image: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function runIllustrator(
  input: IllustratorInput
): Promise<IllustratorOutput> {
  const { pipelineRunId, pipelineStepId } = input;
  const supabase = createAdminClient();

  // 1. Mark step as running
  await supabase
    .from("pipeline_steps")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", pipelineStepId);

  try {
    // 2. Fetch the report created by the refiner
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, title, slug, metadata")
      .eq("pipeline_run_id", pipelineRunId)
      .single();

    if (reportError || !report) {
      throw new Error(
        `No report found for pipeline_run_id ${pipelineRunId}: ${reportError?.message ?? "not found"}`
      );
    }

    const { id: reportId, title, slug } = report as ReportRow;

    // 3. Fetch executive summary for context
    const { data: sections } = await supabase
      .from("report_sections")
      .select("section_key, content")
      .eq("report_id", reportId)
      .eq("section_key", "executive_summary")
      .single();

    const executiveSummary =
      (sections as SectionRow | null)?.content ?? "";

    // 4. Build prompt and generate image
    const prompt = buildImagePrompt(title, executiveSummary);

    console.log(
      `[Illustrator] Generating cover image for report "${slug}" with prompt (${prompt.length} chars)`
    );

    const imageBuffer = await generateImage(prompt);

    console.log(
      `[Illustrator] Image generated — ${(imageBuffer.length / 1024).toFixed(0)}KB`
    );

    // 5. Upload to Supabase Storage
    const coverImageUrl = await uploadCoverImage(imageBuffer, slug);

    console.log(`[Illustrator] Cover uploaded: ${coverImageUrl}`);

    // 6. Update report with cover_image_url
    const { error: updateError } = await supabase
      .from("reports")
      .update({ cover_image_url: coverImageUrl })
      .eq("id", reportId);

    if (updateError) {
      throw new Error(
        `Failed to update report cover_image_url: ${updateError.message}`
      );
    }

    // 7. Mark step as completed
    const output: IllustratorOutput = { coverImageUrl };

    await supabase
      .from("pipeline_steps")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        output_data: output,
      })
      .eq("id", pipelineStepId);

    return output;
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Unknown error in Illustrator agent";

    await supabase
      .from("pipeline_steps")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", pipelineStepId);

    throw err;
  }
}
