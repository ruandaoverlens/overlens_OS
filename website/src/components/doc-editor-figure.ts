import { Node, mergeAttributes } from "@tiptap/core";

/*
 * O markdown da base usa `<figure>` + `<figcaption>` em HTML para imagem com
 * legenda. Sem nós próprios, o Tiptap descarta as tags (a legenda vira
 * parágrafo solto e o `<figure>` deixa um parágrafo vazio no lugar) — e o
 * salvamento grava o documento já sem elas.
 */

/** Legenda da figura. Mesmo papel do `<figcaption>` do MarkdownRenderer. */
export const Figcaption = Node.create({
  name: "figcaption",
  content: "inline*",
  parseHTML() {
    return [{ tag: "figcaption" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figcaption", mergeAttributes(HTMLAttributes), 0];
  },
  renderMarkdown(node, helpers) {
    return `<figcaption>${helpers.renderChildren(node.content ?? [])}</figcaption>`;
  },
});

/** Imagem com legenda. O conteúdo segue a ordem do HTML: imagem e, opcionalmente, legenda. */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "image figcaption?",
  isolating: true,
  parseHTML() {
    return [{ tag: "figure" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes), 0];
  },
  renderMarkdown(node, helpers) {
    // Formato canônico usado nos arquivos da base: tags em linhas próprias e a
    // imagem isolada por linhas em branco.
    const children = (node.content ?? []).map((child) => helpers.renderChildren(child));
    return ["<figure>", "", ...children.flatMap((c, i) => (i === 0 ? [c, ""] : [c])), "</figure>"].join("\n");
  },
});

/*
 * O marked encerra um bloco HTML na primeira linha em branco, então
 * `<figure>` / imagem / `<figcaption>` chegariam como tokens separados e o
 * parser não teria como remontar a figura. Colapsamos o bloco numa linha só
 * antes de carregar; `renderMarkdown` devolve o formato original ao salvar.
 */
const FIGURE_BLOCK_RE = /<figure>\s*(!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>)\s*(<figcaption>[\s\S]*?<\/figcaption>)?\s*<\/figure>/g;
const MD_IMAGE_RE = /^!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?[^)]*\)$/;

export function collapseFigures(md: string): string {
  return md.replace(FIGURE_BLOCK_RE, (_match, image: string, caption = "") => {
    const asMarkdown = MD_IMAGE_RE.exec(image.trim());
    const img = asMarkdown
      ? `<img src="${asMarkdown[2]}" alt="${asMarkdown[1]}">`
      : image.trim();
    return `<figure>${img}${caption ?? ""}</figure>`;
  });
}
