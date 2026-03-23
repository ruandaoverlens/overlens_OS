import { getSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function DocsIndex() {
  return (
    <SystemIndex
      title="Brand System"
      description="Sistema completo de marca da Overlens. Navegue pelas seções abaixo."
      sections={getSections()}
      basePath="/docs"
    />
  );
}
