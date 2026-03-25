import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeedbackSummary {
  id: string;
  report_id: string;
  section_key: string;
  original_content: string | null;
  edited_content: string | null;
  review_notes: string | null;
  feedback_type: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Save feedback when admin edits a section
// ---------------------------------------------------------------------------

export async function saveSectionFeedback(params: {
  reportId: string;
  sectionKey: string;
  originalContent: string;
  editedContent: string;
  reviewNotes?: string;
  userId: string;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("refiner_feedback").insert({
    report_id: params.reportId,
    section_key: params.sectionKey,
    original_content: params.originalContent,
    edited_content: params.editedContent,
    review_notes: params.reviewNotes ?? null,
    feedback_type: "edit",
    created_by: params.userId,
  });

  if (error) {
    throw new Error(`Failed to save section feedback: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Get recent feedback entries
// ---------------------------------------------------------------------------

export async function getRecentFeedback(
  limit = 10
): Promise<FeedbackSummary[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("refiner_feedback")
    .select(
      "id, report_id, section_key, original_content, edited_content, review_notes, feedback_type, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent feedback: ${error.message}`);
  }

  return (data ?? []) as FeedbackSummary[];
}

// ---------------------------------------------------------------------------
// Build a "lessons learned" prompt section from recent feedback
// ---------------------------------------------------------------------------

/**
 * Fetches the last 10 feedback entries, groups them by section_key, and
 * returns a string summarising the patterns observed. This string is intended
 * to be appended to the refiner's system prompt so future reports reflect the
 * admin's editorial preferences.
 */
export async function buildFeedbackPrompt(): Promise<string> {
  let entries: FeedbackSummary[];

  try {
    entries = await getRecentFeedback(10);
  } catch {
    // If feedback cannot be fetched, fail gracefully and return an empty
    // string so the refiner can still run without the lessons section.
    return "";
  }

  if (entries.length === 0) {
    return "";
  }

  // Group entries by section_key
  const bySection = new Map<string, FeedbackSummary[]>();
  for (const entry of entries) {
    const list = bySection.get(entry.section_key) ?? [];
    list.push(entry);
    bySection.set(entry.section_key, list);
  }

  const sectionSummaries: string[] = [];

  for (const [sectionKey, sectionEntries] of bySection) {
    const lines: string[] = [];

    // Collect review notes that are non-empty
    const notes = sectionEntries
      .map((e) => e.review_notes)
      .filter((n): n is string => !!n && n.trim().length > 0);

    // Detect whether the admin consistently shortened or expanded content
    let shortenedCount = 0;
    let expandedCount = 0;
    for (const entry of sectionEntries) {
      if (entry.original_content && entry.edited_content) {
        const originalLen = entry.original_content.length;
        const editedLen = entry.edited_content.length;
        if (editedLen < originalLen * 0.85) shortenedCount++;
        else if (editedLen > originalLen * 1.15) expandedCount++;
      }
    }

    lines.push(`Seção: ${sectionKey} (${sectionEntries.length} edição(ões) recente(s))`);

    if (shortenedCount > 0 && shortenedCount >= sectionEntries.length / 2) {
      lines.push(
        `- O administrador tende a ENCURTAR o conteúdo desta seção. Seja mais conciso.`
      );
    } else if (expandedCount > 0 && expandedCount >= sectionEntries.length / 2) {
      lines.push(
        `- O administrador tende a EXPANDIR o conteúdo desta seção. Forneça mais detalhes.`
      );
    }

    if (notes.length > 0) {
      lines.push(`- Notas de revisão anteriores:`);
      for (const note of notes) {
        lines.push(`  • ${note.trim()}`);
      }
    }

    sectionSummaries.push(lines.join("\n"));
  }

  if (sectionSummaries.length === 0) {
    return "";
  }

  return [
    "LIÇÕES DAS REVISÕES ANTERIORES:",
    "Com base nas edições feitas pelo administrador em relatórios anteriores, considere os seguintes padrões ao gerar este relatório:",
    "",
    ...sectionSummaries,
    "",
    "Aplique essas preferências editoriais ao gerar cada seção correspondente.",
  ].join("\n");
}
