import type { AssetUploadConfig } from "@/lib/asset-upload-types";
import { MYCELIUM_TYPES } from "@/lib/mycelium-types";

export const myceliumReferenceConfig: AssetUploadConfig = {
  slug: "mycelium-reference",
  title: "Nova referência",
  description:
    "Adicione um post de referência ao Mycelium — link primário, mídias opcionais e metadados.",
  accept: "*",
  maxSizeMB: 0,
  multiple: true,
  fields: [
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      options: MYCELIUM_TYPES.map((t) => ({ value: t.value, label: t.label })),
    },
    {
      name: "titulo",
      label: "Título",
      type: "text",
      required: true,
      placeholder: "Título da referência",
    },
    {
      name: "descricao",
      label: "Descrição",
      type: "textarea",
      required: false,
      placeholder: "Por que essa referência importa? O que ela ilumina?",
    },
    {
      name: "url",
      label: "URL",
      type: "text",
      required: false,
      placeholder: "https://...",
      helperText: "Link primário da referência (artigo, vídeo, post, etc).",
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      required: false,
      placeholder: "Ex: design, filosofia, ferramenta, inspiração...",
    },
  ],
};
