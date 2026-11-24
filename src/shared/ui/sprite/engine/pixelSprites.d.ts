export type TSpriteMountOptions = {
  fit?: boolean
}

export type TSpriteName = string

export function mount(
  canvas: HTMLCanvasElement,
  name: TSpriteName,
  opt?: TSpriteMountOptions,
): unknown

export function hero(element: HTMLElement): void

export function refresh(): void

export const SPRITE_NAMES: readonly string[]

declare const pixelSpritesApi: {
  mount: typeof mount
  hero: typeof hero
  refresh: typeof refresh
  names: readonly string[]
}

export default pixelSpritesApi
