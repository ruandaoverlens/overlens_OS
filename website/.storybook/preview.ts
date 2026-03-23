import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'overlens-dark',
      values: [
        { name: 'overlens-dark', value: '#000000' },
        { name: 'surface-900', value: '#202020' },
        { name: 'surface-950', value: '#101010' },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => {
      // Force dark class on html element (dark-only platform)
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      return Story()
    },
  ],
}

export default preview
