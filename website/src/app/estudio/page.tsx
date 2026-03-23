import { getEstudioSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function EstudioIndex() {
  const playbookTitles = ["Playbook de Conteúdo", "Playbook de Edição de Vídeos"];
  const sections = getEstudioSections().filter((s) => !playbookTitles.includes(s.title));

  return (
    <SystemIndex
      title="Content System"
      description="Playbooks, conteúdo e produção criativa da Overlens."
      sections={sections}
      basePath="/estudio"
    />
  );
}
