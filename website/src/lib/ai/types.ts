import type { ModelId } from "./models";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  cited_segments?: string[] | null;
  routed_doc_ids?: string[] | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  feedback?: -1 | 0 | 1 | null;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  model: ModelId;
  plan_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface CitedSection {
  title: string;
  segments: string[]; // path partido em slugs (ex.: ["brand-system", "04-nucleo", "02-posicionamento"])
}

export interface DocIndexEntry {
  id: string;                // segments.join("/")
  title: string;
  summary: string;
  topics: string[];
  keywords: string[];
  priority: "high" | "medium" | "low";
  ai_when_to_use: string;
  segments: string[];
  system: "brand_system" | "estudio_criativo" | "growth_system" | "pacote_cultural";
}

// Vercel AI SDK message format (alinhar com `useChat`)
export interface UIMessage {
  id: string;
  role: ChatRole;
  content: string;
}
