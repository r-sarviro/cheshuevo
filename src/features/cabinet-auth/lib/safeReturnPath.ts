import {
  CABINET_BOOKINGS_PATH,
  CABINET_LOGIN_PATH,
} from '@/shared/config'

/** Same-app path only; blocks open redirects via absolute URLs. */
export function safeReturnPath(
  from: unknown,
  fallback: string = CABINET_BOOKINGS_PATH,
): string {
  if (!from || typeof from !== 'object') return fallback
  const loc = from as { pathname?: unknown; search?: unknown; hash?: unknown }
  if (typeof loc.pathname !== 'string' || !loc.pathname.startsWith('/')) {
    return fallback
  }
  if (loc.pathname === CABINET_LOGIN_PATH) return fallback
  const search = typeof loc.search === 'string' ? loc.search : ''
  const hash = typeof loc.hash === 'string' ? loc.hash : ''
  return `${loc.pathname}${search}${hash}`
}
