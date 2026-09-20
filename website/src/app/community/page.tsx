import { getCommunitySections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function CommunityIndex() {
  return (
    <SystemIndex
      title="Community System"
      description="Como a cultura da Overlens funciona na pratica: Atoms, participacao, reputacao, rituais, colaboracao e governanca. Documento interno, em construcao."
      sections={getCommunitySections()}
      basePath="/community"
    />
  );
}
