import { getSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function DocsIndex() {
  return (
    <SystemIndex
      title="Brand System"
      heading="Introdução ao Brand System"
      questions={[
        "Qual é o posicionamento atual?",
        "O que significa ser um Atom?",
        "Quais são as virtudes da marca?",
        "Como é o tom de voz da Overlens?",
        "Quais arquétipos a marca usa?",
        "Como aplicar o símbolo e o logo?",
        "Quais são as cores da marca?",
        "Qual tipografia devo usar?",
        "Como a marca conta sua história?",
        "Que termos o glossário define?",
      ]}
      description="Sistema completo de marca da Overlens."
      sections={getSections()}
      basePath="/docs"
    />
  );
}
