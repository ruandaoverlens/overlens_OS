/**
 * Navegação do módulo Registros — fonte única para a sidebar, a command
 * palette e o breadcrumb (sem ícones para poder ser importada no servidor).
 */
export const REGISTROS_NAV_ITEMS: { href: string; title: string; exact?: boolean }[] = [
  { href: "/registros", title: "Visão Geral", exact: true },
  { href: "/registros/busca", title: "Busca" },
  { href: "/registros/assistente", title: "Assistente" },
  { href: "/registros/marcas", title: "Marcas" },
  { href: "/registros/dominios", title: "Domínios" },
  { href: "/registros/registrar", title: "Processos" },
  { href: "/registros/documentos", title: "Documentos" },
  { href: "/registros/alertas", title: "Alertas" },
  { href: "/registros/radar", title: "Radar" },
];

/** Mapa segmento → título, para o breadcrumb não perder acentos. */
export const REGISTROS_LABELS: Record<string, string> = Object.fromEntries(
  REGISTROS_NAV_ITEMS.filter((i) => i.href !== "/registros").map((i) => [
    i.href.split("/").pop() as string,
    i.title,
  ]),
);
