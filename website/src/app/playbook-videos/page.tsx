import { redirect } from "next/navigation";
import { getFirstPlaybookVideosSegments } from "@/lib/docs";

export default function PlaybookVideosIndex() {
  const first = getFirstPlaybookVideosSegments();
  if (first) {
    redirect("/playbook-videos/" + first.join("/"));
  }
  redirect("/estudio");
}
