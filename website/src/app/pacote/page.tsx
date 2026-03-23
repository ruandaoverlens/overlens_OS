import { getPacoteSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function PacoteIndex() {
  return (
    <SystemIndex
      title="Pacote Cultural"
      description="Referências, inspirações e repertório cultural da Overlens."
      sections={getPacoteSections()}
      basePath="/pacote"
    />
  );
}
