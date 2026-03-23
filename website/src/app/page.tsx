import { redirect } from "next/navigation";
import { getFirstDocSegments } from "@/lib/docs";

export default function Home() {
  const first = getFirstDocSegments();
  if (first) {
    redirect("/docs/" + first.join("/"));
  }
  redirect("/docs");
}
