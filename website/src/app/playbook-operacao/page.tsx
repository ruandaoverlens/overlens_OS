import { redirect } from "next/navigation";
import { getFirstPlaybookOperacaoSegments } from "@/lib/docs";

export default function PlaybookOperacaoIndex() {
  const first = getFirstPlaybookOperacaoSegments();
  if (first) {
    redirect("/playbook-operacao/" + first.join("/"));
  }
  redirect("/growth");
}
