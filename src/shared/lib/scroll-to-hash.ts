import type { MouseEvent as ReactMouseEvent } from 'react'

/** Scroll to an element id; used for in-page anchors. */
export function scrollToHashId(
  id: string,
  behavior: ScrollBehavior = 'smooth',
): void {
  if (!id || typeof document === 'undefined') {
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
}

/**
 * Same-route hash links: React Router updates the URL but often skips
 * native browser scroll. Handle scroll ourselves when already on the path.
 * @returns true if the click was handled (caller should skip default nav).
 */
export function handleInPageHashNav(
  event: ReactMouseEvent<HTMLAnchorElement>,
  href: string,
  currentPathname: string,
): boolean {
  const hashIndex = href.indexOf('#')
  if (hashIndex < 0) {
    return false
  }

  const pathPart = href.slice(0, hashIndex)
  const id = href.slice(hashIndex + 1)
  if (!id) {
    return false
  }

  const targetPath = pathPart === '' ? '/' : pathPart
  if (currentPathname !== targetPath) {
    return false
  }

  event.preventDefault()
  const nextUrl = `${targetPath}#${id}`
  if (`${window.location.pathname}${window.location.hash}` !== nextUrl) {
    window.history.pushState(null, '', nextUrl)
  }
  scrollToHashId(id)
  return true
}
