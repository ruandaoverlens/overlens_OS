import { redirect } from "next/navigation";
import { getFirstPlaybookConteudoSegments } from "@/lib/docs";

export default function PlaybookConteudoIndex() {
  const first = getFirstPlaybookConteudoSegments();
  if (first) {
    redirect("/playbook-conteudo/" + first.join("/"));
  }
  redirect("/estudio");
}
