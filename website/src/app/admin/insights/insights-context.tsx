"use client";

import { createContext, useContext } from "react";

// ─── Types (espelham /api/admin/insights) ──────────────────

export interface Overview {
  totalMembers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  msgsLast30d: number;
  totalTokensOut: number;
}
export interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  conversations: number;
  messages: number;
  questions: number;
  tokensOut: number;
  lastActive: string | null;
}
export interface Topic {
  id: string;
  count: number;
  title: string;
  href: string | null;
}
export interface Question {
  id: string;
  content: string;
  name: string;
  email: string;
  conversationId: string;
  createdAt: string;
}
export interface Feedback {
  up: number;
  down: number;
  neutral: number;
  none: number;
}
export interface InsightsData {
  overview: Overview;
  topMembers: Member[];
  topTopics: Topic[];
  feedback: Feedback;
  volumeByDay: { day: string; count: number }[];
  questions: Question[];
  query: string | null;
}

// ─── Helpers compartilhados pelas páginas do painel ────────

export const nf = new Intl.NumberFormat("pt-BR");

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ─── Context ───────────────────────────────────────────────

export interface InsightsContextValue {
  data: InsightsData;
  /** Recarrega os dados, com busca opcional nas perguntas. */
  reload: (q?: string) => Promise<void>;
  searching: boolean;
}

const InsightsContext = createContext<InsightsContextValue | null>(null);

export const InsightsProvider = InsightsContext.Provider;

export function useInsights(): InsightsContextValue {
  const ctx = useContext(InsightsContext);
  if (!ctx) {
    throw new Error("useInsights must be used within the insights layout");
  }
  return ctx;
}
