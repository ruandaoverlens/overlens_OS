import { getBusinessSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function BusinessIndex() {
  return (
    <SystemIndex
      title="Business Doc"
      description="A sobrecamada de visão do negócio da Overlens: tese, modelos, arquitetura de ofertas e receita, estratégia e apostas. Documento interno de acesso restrito, em transição."
      sections={getBusinessSections()}
      basePath="/business"
    />
  );
}
