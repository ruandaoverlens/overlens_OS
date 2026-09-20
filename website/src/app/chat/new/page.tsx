import type { Metadata } from "next";
import { Suspense } from "react";
import { NewChatPrompt } from "../_components/new-chat-prompt";

export const metadata: Metadata = {
  title: "Nova conversa",
};

export default function NewChatPage() {
  return (
    <Suspense fallback={null}>
      <NewChatPrompt />
    </Suspense>
  );
}
