import { getPacoteSections } from "@/lib/docs";
import { SystemIndex } from "@/components/system-index";

export default function PacoteIndex() {
  return (
    <SystemIndex
      title="Pacote Cultural"
      heading="Introdução ao Pacote Cultural"
      questions={[
        "Quais livros devo ler?",
        "Que filmes traduzem a Overlens?",
        "Quais músicas nos representam?",
        "Que animações estão na lista?",
        "Por que curamos referências?",
        "O que é uma obra sinérgica?",
        "Qual livro explica a tese?",
        "O que assistir para entender?",
        "Quais referências são fundadoras?",
        "Por onde começar no pacote?",
      ]}
      description="Referências, inspirações e repertório cultural da Overlens."
      sections={getPacoteSections()}
      basePath="/pacote"
    />
  );
}
