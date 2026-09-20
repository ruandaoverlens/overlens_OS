import { getProductSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function ProductIndex() {
  return (
    <SystemIndex
      title="Product System"
      description="Como a visao da Overlens vira produto: projeto como unidade central, PBL, IA, competencias, evidencias e plataforma. Documento interno, em construcao."
      sections={getProductSections()}
      basePath="/product"
    />
  );
}
