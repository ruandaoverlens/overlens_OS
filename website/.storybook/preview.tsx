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
    (Story) => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      }
      return React.createElement(TooltipProvider, null, Story());
    },
  ],
};

export default preview;
