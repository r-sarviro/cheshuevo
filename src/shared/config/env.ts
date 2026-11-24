function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/\/+$/, '')
}

export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  siteUrl: normalizeSiteUrl(import.meta.env.VITE_SITE_URL),
} as const
