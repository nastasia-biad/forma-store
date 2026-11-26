import { absoluteUrl, isAbsoluteOrigin } from '../content/site.ts'

const privatePaths = ['/cart', '/checkout', '/favorites', '/orders']

export function slugsInSource(source: string): string[] {
  return [...source.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((match) => match[1] ?? '')
}

export function readSiteOrigin(source: string): string {
  return source.match(/export const siteOrigin = '([^']*)'/)?.[1] ?? ''
}

export function buildSitemapPaths(
  productSlugs: readonly string[],
  articleSlugs: readonly string[],
): string[] {
  return [
    '/',
    '/catalog',
    ...productSlugs.map((slug) => `/catalog/${slug}`),
    '/about',
    '/delivery',
    '/payment',
    '/returns',
    '/contacts',
    '/faq',
    '/journal',
    ...articleSlugs.map((slug) => `/journal/${slug}`),
  ]
}

export function isPrivatePath(path: string): boolean {
  return privatePaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function renderSitemap(paths: readonly string[], origin: string): string {
  const note = isAbsoluteOrigin(origin)
    ? ''
    : '<!-- Укажите siteOrigin в src/content/site.ts и пересоберите проект, чтобы loc стали абсолютными. -->\n'
  const urls = paths
    .map((path) => `  <url>\n    <loc>${absoluteUrl(path, origin)}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n${note}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function renderRobots(origin: string): string {
  const sitemap = isAbsoluteOrigin(origin)
    ? `\nSitemap: ${absoluteUrl('/sitemap.xml', origin)}\n`
    : '\n# Sitemap: появится после siteOrigin в src/content/site.ts и пересборки.\n'

  return `User-agent: *\nAllow: /\n\nDisallow: /cart\nDisallow: /checkout\nDisallow: /favorites\nDisallow: /orders\n${sitemap}`
}
