import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: [
      '**/__mocks__/**',
      '**/*.test.*',
      '**/e2e/**',
      '**/test/**',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
  {
    // Слайсы пока только на smoke HomePage; включить после pages каталога/брони.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
])
