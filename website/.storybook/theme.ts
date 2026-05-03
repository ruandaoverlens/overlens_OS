import { create } from "storybook/theming/create";

/**
 * Tema de chrome do Storybook (sidebar/header/toolbar).
 * - `colorSecondary` (atmos) é a cor de destaque das interações da chrome
 *   (item selecionado, foco, etc.).
 * - `brandTitle` é HTML inline com a marca OVERLENS® em Outfit.
 * - `fontBase` cai em Inter (carregada via `manager-head.html`).
 */
export const overlensTheme = create({
  base: "dark",
  appBg: "#000000",
  appContentBg: "#000000",
  barBg: "#000000",
  colorSecondary: "#8ec5d0",
  textColor: "#fafafa",
  textInverseColor: "#000000",
  brandTitle: `<span style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 28px; text-transform: uppercase;">OVERLENS<sup style="font-size: 18px; vertical-align: super;">&reg;</sup></span>`,
  brandTarget: "_self",
  fontBase: "'Inter', sans-serif",
  barSelectedColor: "#8ec5d0",
  barHoverColor: "#8ec5d0",
});
