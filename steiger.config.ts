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
    // Product slices still thin (one page each); revisit after more screens.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
])
