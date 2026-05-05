import { redirect } from "next/navigation";
import { getChatConversations } from "@/lib/chat-conversations";

export default async function ChatHome() {
  const conversations = await getChatConversations();
  if (conversations.length > 0) {
    redirect(`/chat/${conversations[0].id}`);
  }
  redirect("/chat/new");
}
