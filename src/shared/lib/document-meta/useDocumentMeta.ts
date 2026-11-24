import { useEffect } from 'react'

import { env } from '@/shared/config'

export interface IDocumentMetaOptions {
  title: string
  description?: string
  canonicalPath?: string
  imageUrl?: string
  noIndex?: boolean
}

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function resolveOrigin(): string {
  if (env.siteUrl) return env.siteUrl
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

function resolveCanonical(path: string | undefined, origin: string): string {
  if (!origin) return ''
  const normalizedPath =
    !path || path === '/'
      ? '/'
      : path.startsWith('/')
        ? path
        : `/${path}`
  return `${origin}${normalizedPath === '/' ? '/' : normalizedPath}`
}

/** Syncs document title and primary SEO meta tags for the active route. */
export function useDocumentMeta(options: IDocumentMetaOptions): void {
  const { title, description, canonicalPath, imageUrl, noIndex } = options

  useEffect(() => {
    document.title = title

    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
      upsertMeta('name', 'twitter:description', description)
    }

    upsertMeta('property', 'og:title', title)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('name', 'twitter:card', 'summary')

    const origin = resolveOrigin()
    const canonical = resolveCanonical(canonicalPath, origin)
    if (canonical) {
      upsertLink('canonical', canonical)
      upsertMeta('property', 'og:url', canonical)
    }

    if (imageUrl) {
      upsertMeta('property', 'og:image', imageUrl)
      upsertMeta('name', 'twitter:image', imageUrl)
    }

    if (noIndex) {
      upsertMeta('name', 'robots', 'noindex, nofollow')
    } else {
      const robots = document.head.querySelector<HTMLMetaElement>(
        'meta[name="robots"]',
      )
      if (robots) robots.remove()
    }
  }, [title, description, canonicalPath, imageUrl, noIndex])
}
