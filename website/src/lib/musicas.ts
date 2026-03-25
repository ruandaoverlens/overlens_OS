import { getAssetPreviewUrl } from "@/lib/supabase/storage";

export interface Track {
  id: string;
  filename: string;
  title: string;
  artist: string;
  tags: string[];
  src: string;
  downloadUrl: string;
}

interface TrackEntry {
  file: string;
  tags: string[];
}

const MUSIC_ENTRIES: TrackEntry[] = [
  { file: "Ardie Son - A Winter Migration.mp3", tags: ["ambient", "cinematic"] },
  { file: "Curtis Cole - Odd Numbers.mp3", tags: ["electronic", "minimal"] },
  { file: "Flint - Bleeps  Bloops.mp3", tags: ["sfx", "electronic", "glitch"] },
  { file: "Ian Post - New World.mp3", tags: ["cinematic", "epic"] },
  { file: "Jimmy Svensson - Boot Sequence.mp3", tags: ["sfx", "electronic", "tech"] },
  { file: "Jimmy Svensson - Digital Dreams.mp3", tags: ["electronic", "synth"] },
  { file: "Nobou - Lifelines.mp3", tags: ["ambient", "chill"] },
  { file: "Nobou - Precious Mornings.mp3", tags: ["ambient", "chill"] },
  { file: "Nsee - Breath In Out - Nsee Remake.mp3", tags: ["ambient", "downtempo"] },
  { file: "Solis - Cosmic Cascades.mp3", tags: ["ambient", "cinematic", "space"] },
  { file: "Stanley Gurvich - Free Radicals.mp3", tags: ["electronic", "experimental"] },
  { file: "Stephen Keech - Black Hole.mp3", tags: ["cinematic", "dark", "space"] },
  { file: "Stephen Keech - The Void.mp3", tags: ["cinematic", "dark"] },
  { file: "Theatre of Delays - Outer Limits.mp3", tags: ["electronic", "cinematic"] },
  { file: "Tiko Tiko - Depth of Field.mp3", tags: ["electronic", "minimal"] },
  { file: "Tiko Tiko - Echoes of Tomorrow.mp3", tags: ["electronic", "cinematic"] },
  { file: "Tiko Tiko - Loose.mp3", tags: ["electronic", "chill"] },
  { file: "Tiko Tiko - More Peaks.mp3", tags: ["electronic", "upbeat"] },
  { file: "Tiko Tiko - Still Forever.mp3", tags: ["ambient", "chill"] },
  { file: "Tiko Tiko - Underwater Breeze.mp3", tags: ["ambient", "chill", "nature"] },
  { file: "Yarin Primak - Still Need Syndrome.mp3", tags: ["electronic", "experimental"] },
  { file: "Yehezkel Raz - Corals Under the Sun.mp3", tags: ["ambient", "nature"] },
];

function parseEntry(entry: TrackEntry): Track {
  const noExt = entry.file.replace(".mp3", "");
  const parts = noExt.split(" - ");
  const artist = parts[0] ?? "Unknown";
  const title = parts.slice(1).join(" - ") || noExt;
  const id = noExt.replace(/\s+/g, "-").toLowerCase();

  return {
    id,
    filename: entry.file,
    title,
    artist,
    tags: entry.tags,
    src: getAssetPreviewUrl("Musicas", entry.file),
    downloadUrl: `/api/assets/download?file=${encodeURIComponent("Musicas/" + entry.file)}`,
  };
}

export const tracks: Track[] = MUSIC_ENTRIES.map(parseEntry);

export function getAllMusicTags(): string[] {
  const tagSet = new Set<string>();
  for (const t of tracks) {
    for (const tag of t.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
