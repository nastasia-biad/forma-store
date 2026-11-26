/**
 * Публичный адрес сайта без пути и без завершающего слэша, например https://forma.example.
 * Пока домен не выбран, оставьте пустую строку.
 * Пустое или неполное значение не превращается в абсолютную ссылку.
 * После выбора домена укажите его здесь и пересоберите проект:
 * sitemap и robots получат абсолютные адреса.
 */
export const siteOrigin = ''

export const siteName = 'FORMA'

export function isAbsoluteOrigin(origin: string): boolean {
  return /^https?:\/\/[^/\s]+$/i.test(origin.trim().replace(/\/$/, ''))
}

export function absoluteUrl(path: string, origin = siteOrigin): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = origin.trim().replace(/\/$/, '')

  if (!isAbsoluteOrigin(base)) {
    return normalized
  }

  return `${base}${normalized}`
}
