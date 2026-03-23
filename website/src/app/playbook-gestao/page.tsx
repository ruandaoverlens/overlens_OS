import { redirect } from "next/navigation";
import { getFirstPlaybookGestaoSegments } from "@/lib/docs";

export default function PlaybookGestaoIndex() {
  const first = getFirstPlaybookGestaoSegments();
  if (first) {
    redirect("/playbook-gestao/" + first.join("/"));
  }
  redirect("/growth");
}
