import { getEstudioSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function EstudioIndex() {
  const playbookTitles = ["Playbook de Conteúdo", "Playbook de Edição de Vídeos"];
  const sections = getEstudioSections().filter((s) => !playbookTitles.includes(s.title));

  return (
    <SystemIndex
      title="Content System"
      heading="Introdução ao Content System"
      questions={[
        "Como solicito algo ao Estúdio?",
        "O que é uma Big Idea?",
        "Como pensamos o conteúdo?",
        "Quais são os nossos touchpoints?",
        "Como funciona o fluxo de vídeo?",
        "O que são personas sintéticas?",
        "Onde ficam os swipe files?",
        "Como enquadrar um post?",
        "Que métricas seguimos em vídeo?",
        "O que há no playbook de conteúdo?",
      ]}
      description="Playbooks, conteúdo e produção criativa da Overlens."
      sections={sections}
      basePath="/estudio"
    />
  );
}
