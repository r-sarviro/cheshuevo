import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

/** Stub catalog ids from src/entities/dragon/model/fixtures.ts (1..20). */
const DRAGON_IDS = Array.from({ length: 20 }, (_, i) => i + 1)

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

if (!siteUrl) {
  console.error(
    '[seo:generate] VITE_SITE_URL is required (set in .env or environment).',
  )
  process.exit(1)
}

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

const urls = ['/', ...DRAGON_IDS.map((id) => `/dragons/${id}`)]
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
  `[seo:generate] Wrote robots.txt and sitemap.xml for ${siteUrl} (${urls.length} urls).`,
)
