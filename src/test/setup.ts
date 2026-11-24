import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

import '@/shared/config'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

class MockObserver {
  observe() {
    return undefined
  }
  unobserve() {
    return undefined
  }
  disconnect() {
    return undefined
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockObserver,
})

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockObserver,
})

vi.mock('@/shared/ui/sprite/engine/pixelSprites.js', () => {
  const api = {
    mount: vi.fn(),
    hero: vi.fn(),
    refresh: vi.fn(),
    names: ['loader', 'flame', 'pearl', 'clouds'],
  }
  return {
    ...api,
    SPRITE_NAMES: api.names,
    default: api,
  }
})
