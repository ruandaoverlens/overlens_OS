import { addons } from "storybook/manager-api";

import { overlensTheme } from "./theme";

/**
 * Branding da chrome do Storybook.
 * Fontes (Outfit, Inter, JetBrains Mono) e overrides finos da chrome
 * (search bar, scrollbar oculta, favicon de triângulo, replace do verde
 * default por atmos) ficam em `manager-head.html`.
 */
addons.setConfig({
  theme: overlensTheme,
});
