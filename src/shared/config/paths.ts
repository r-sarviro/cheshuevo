/** App route paths (single source for links, routes, SEO canonicals). */

export const HOME_PATH = '/'

export const CATALOG_HASH = 'catalog'

/** In-page catalog anchor on the home page. */
export const CATALOG_PATH = `${HOME_PATH}#${CATALOG_HASH}`

export const PLAY_PATH = '/test-flight'

export const NOT_FOUND_PATH = '/404'

export const DRAGONS_PATH = '/dragons'

/** React Router pattern for a dragon booking page. */
export const DRAGON_ROUTE = `${DRAGONS_PATH}/:dragonId`

export function dragonPath(dragonId: number | string): string {
  return `${DRAGONS_PATH}/${dragonId}`
}
