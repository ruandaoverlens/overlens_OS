import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(here, '../src');

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ],
  async viteFinal(config) {
    config.resolve = config.resolve ?? {};
    const existingAlias = config.resolve.alias;
    if (Array.isArray(existingAlias)) {
      config.resolve.alias = [
        { find: '@', replacement: srcPath },
        ...existingAlias,
      ];
    } else {
      config.resolve.alias = {
        '@': srcPath,
        ...(existingAlias ?? {}),
      };
    }
    return config;
  },
};
export default config;