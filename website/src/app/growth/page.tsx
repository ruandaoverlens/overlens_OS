import { getGrowthSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function GrowthIndex() {
  const sections = getGrowthSections().filter((s) => s.title !== "Playbooks");

  return (
    <SystemIndex
      title="Growth System"
      heading="Introdução ao Growth System"
      questions={[
        "Quem é o público da Overlens?",
        "O que é o Atlas?",
        "Como funciona o Overpass?",
        "O que é a Vanguarda?",
        "Quais são os quatro modos?",
        "Que jobs o público quer resolver?",
        "Como funciona o growth loop?",
        "Quem são nossos concorrentes?",
        "Qual é o perfil ideal de cliente?",
        "Como vendemos hoje?",
      ]}
      description="Crescimento, métricas e estratégia comercial da Overlens."
      sections={sections}
      basePath="/growth"
    />
  );
}
