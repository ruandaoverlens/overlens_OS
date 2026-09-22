import { getProductSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function ProductIndex() {
  return (
    <SystemIndex
      title="Product System"
      heading="Introdução ao Product System"
      questions={[
        "Como funciona o PBL na Overlens?",
        "Por que o projeto é central?",
        "O que é o grafo de capacidades?",
        "Como registramos evidências?",
        "Qual é o papel da IA no produto?",
        "O que é o Overlens OS?",
        "Quais princípios guiam o produto?",
        "O que está no roadmap?",
        "Como medimos progresso?",
        "Como uma capacidade é provada?",
      ]}
      description="Como a visão da Overlens vira produto: projetos, PBL, IA, competências e plataforma."
      sections={getProductSections()}
      basePath="/product"
    />
  );
}
