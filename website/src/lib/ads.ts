export type AdType = "image" | "video" | "carousel";

export interface AdMedia {
  id: string;
  ad_id: string;
  sort_order: number;
  storage_path: string;
  preview_path: string | null;
  mime_type: string | null;
  filename: string | null;
}

export interface Ad {
  id: string;
  type: AdType;
  title: string;
  platform: string | null;
  ctr: number | null;
  retention_seconds: number | null;
  retention_percent: number | null;
  conversion: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  media: AdMedia[];
}

export const AD_PLATFORMS = [
  { value: "meta", label: "Meta (Facebook/Instagram)" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google Ads" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "outro", label: "Outro" },
] as const;

export function platformLabel(value: string | null): string {
  if (!value) return "Sem plataforma";
  const match = AD_PLATFORMS.find((p) => p.value === value);
  return match?.label ?? value;
}

/** Format a percentage value (numeric column) into "2.5%" or "—". */
export function formatPercent(value: number | null | undefined, fractionDigits = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(fractionDigits)}%`;
}

/** Format seconds into "18s" or "—". */
export function formatSeconds(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const n = Number(value);
  if (n >= 60) {
    const m = Math.floor(n / 60);
    const s = Math.round(n % 60);
    return s > 0 ? `${m}m${s}s` : `${m}m`;
  }
  return `${n}s`;
}
