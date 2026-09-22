import { getBusinessSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function BusinessIndex() {
  return (
    <SystemIndex
      title="Business Doc"
      heading="Introdução ao Business Doc"
      questions={[
        "Qual é a tese do negócio?",
        "Como a Overlens gera receita?",
        "Quais são as apostas atuais?",
        "Como funciona o flywheel?",
        "Quais são os nossos moats?",
        "Qual é a visão e a missão?",
        "Como é a jornada do cliente?",
        "Quais riscos estão mapeados?",
        "Que produtos e serviços temos?",
        "O que mudou no modelo anterior?",
      ]}
      description="Visão do negócio da Overlens: tese, modelos, arquitetura de receita, estratégia e apostas."
      sections={getBusinessSections()}
      basePath="/business"
    />
  );
}
