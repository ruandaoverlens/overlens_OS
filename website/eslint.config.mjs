// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],

  // Camada de notificações: use o wrapper `notify` em vez de importar sonner direto.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/notifications/**",
      "src/components/ui/sonner.tsx",
      "src/components/ui/sonner.stories.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "sonner",
              message:
                "Importe `notify` de `@/lib/notifications/toast` em vez de usar sonner direto.",
            },
          ],
        },
      ],
    },
  },

  // Diálogos nativos: use `useConfirm()` e `notify` (exceto em stories).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.stories.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "alert",
          message: "Use `notify` de `@/lib/notifications/toast` em vez de alert().",
        },
        {
          name: "confirm",
          message: "Use `useConfirm()` de `@/components/ui/confirm-dialog` em vez de confirm().",
        },
      ],
    },
  },
]);

export default eslintConfig;
