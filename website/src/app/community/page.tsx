import { getCommunitySections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function CommunityIndex() {
  return (
    <SystemIndex
      title="Community System"
      heading="Introdução ao Community System"
      questions={[
        "O que significa ser um Atom?",
        "Como funciona a reputação?",
        "Quais rituais acontecem aqui?",
        "O que é o Atom Praxis?",
        "Quais papéis existem por aqui?",
        "Como times e projetos se formam?",
        "Quais são as regras de convívio?",
        "O que a comunidade sustenta?",
        "Como um Atom progride?",
        "Que artefatos representam o Atom?",
      ]}
      description="Como a cultura da Overlens funciona na prática: Atoms, rituais, reputação e governança."
      sections={getCommunitySections()}
      basePath="/community"
    />
  );
}
