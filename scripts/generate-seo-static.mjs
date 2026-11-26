import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(join(root, '.env'))
loadEnvFile(join(root, '.env.example'))

const siteUrl = (process.env.VITE_SITE_URL ?? '').replace(/\/+$/, '')
const apiBaseUrl = (process.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

if (!siteUrl) {
  console.error(
    '[seo:generate] VITE_SITE_URL is required (set in .env or environment).',
  )
  process.exit(1)
}

if (!apiBaseUrl) {
  console.error(
    '[seo:generate] VITE_API_BASE_URL is required to load catalog ids.',
  )
  process.exit(1)
}

async function fetchDragonIds() {
  const response = await fetch(`${apiBaseUrl}/public/dragons`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(
      `GET ${apiBaseUrl}/public/dragons failed with ${response.status}`,
    )
  }
  const body = await response.json()
  const list = Array.isArray(body?.data) ? body.data : []
  const ids = list
    .map((item) => Number(item?.id))
    .filter((id) => Number.isFinite(id) && id > 0)
  return [...new Set(ids)].sort((a, b) => a - b)
}

const dragonIds = await fetchDragonIds().catch((error) => {
  console.error(`[seo:generate] ${error.message}`)
  process.exit(1)
})

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

const urls = [
  '/',
  '/about',
  '/test-flight',
  ...dragonIds.map((id) => `/dragons/${id}`),
]
const urlEntries = urls
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
  </url>`,
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`

mkdirSync(publicDir, { recursive: true })
writeFileSync(join(publicDir, 'robots.txt'), robots, 'utf8')
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf8')

console.log(
  `[seo:generate] Wrote robots.txt and sitemap.xml for ${siteUrl} (${urls.length} urls, ${dragonIds.length} dragons).`,
)
