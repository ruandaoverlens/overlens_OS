import type { Preview } from "@storybook/nextjs-vite";
import * as React from "react";
import { themes } from "storybook/theming";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../src/app/globals.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    docs: {
      theme: {
        ...themes.dark,
        appBg: "#000000",
        appContentBg: "#000000",
        barBg: "#000000",
        colorSecondary: "#8ec5d0",
      },
    },
    options: {
      storySort: {
        order: [
          "Getting Started",
          ["Introduction", "Installation"],
          "Foundations",
          [
            "Overview",
            "Font Sizes",
            "Border Radius",
            "Colors",
            "Typography",
            "Spacing",
            "Effects",
            "Breakpoints",
          ],
          "Base Components",
          "Components",
          ["Catalog", "Base", "Core"],
          "Icons",
          ["Catalog", "*"],
          "Brand",
          "Sandbox",
          ["Base", "Core", "Sections"],
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      // O tema vem da barra de ferramentas (globalTypes.theme). Escrevemos a
      // classe e o `color-scheme` no <html> exatamente como o `ThemeProvider`
      // faz na aplicação — é essa classe que liga `:root` (claro) ou `.dark`.
      const theme = context.globals.theme === "light" ? "light" : "dark";
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.classList.toggle("light", theme === "light");
        root.style.colorScheme = theme;
      }
      return React.createElement(TooltipProvider, null, Story());
    },
  ],
  globalTypes: {
    theme: {
      description: "Tema da plataforma",
      toolbar: {
        title: "Tema",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Escuro", icon: "moon" },
          { value: "light", title: "Claro", icon: "sun" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
};

export default preview;
