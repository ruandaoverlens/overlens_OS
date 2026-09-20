import { redirect } from "next/navigation";

/**
 * `/chat` é o destino do crumb "Conversas": sempre a nova conversa, um
 * destino previsível (antes caía na conversa mais recente, que muda).
 */
export default function ChatHome() {
  redirect("/chat/new");
}
