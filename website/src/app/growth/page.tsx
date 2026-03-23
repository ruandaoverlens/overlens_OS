import { getGrowthSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function GrowthIndex() {
  const sections = getGrowthSections().filter((s) => s.title !== "Playbooks");

  return (
    <SystemIndex
      title="Growth System"
      description="Crescimento, métricas e estratégia comercial da Overlens."
      sections={sections}
      basePath="/growth"
    />
  );
}
