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
    // Каркас MVP: мало слайсов → ожидаемые срабатывания. Вернуть после entities/features.
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/no-segmentless-slices': 'off',
    },
  },
])
