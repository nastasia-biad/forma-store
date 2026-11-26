import { describe, expect, it } from 'vitest'
import { absoluteUrl, isAbsoluteOrigin } from '../content/site.ts'
import siteSource from '../content/site.ts?raw'
import { journalArticles, legacyArticleRedirects } from '../content/journal.ts'
import journalSource from '../content/journal.ts?raw'
import { getProducts } from '../data/catalog.ts'
import productSource from '../data/products.ts?raw'
import { pageCopy, productPageMeta, searchPageMeta } from './pages.ts'
import {
  buildSitemapPaths,
  isPrivatePath,
  readSiteOrigin,
  renderRobots,
  renderSitemap,
  slugsInSource,
} from './sitemap.ts'

describe('метаданные страниц', () => {
  it('даёт страницам разные заголовки и описания', () => {
    const pages = Object.values(pageCopy)
    const titles = pages.map((page) => page.title)
    const descriptions = pages.map((page) => page.description)

    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
    expect(descriptions.every((text) => text.length > 40 && text.length <= 160)).toBe(true)
  })

  it('собирает заголовок и описание товара из карточки', () => {
    const product = getProducts()[0]

    expect(product).toBeDefined()

    if (!product) {
      return
    }

    const meta = productPageMeta(product)

    expect(meta.title).toBe(product.name)
    expect(meta.path).toBe(`/catalog/${product.slug}`)
    expect(meta.description).toContain('24')
    expect(meta.image).toBe(product.images[0]?.src)
  })

  it('меняет заголовок поиска и оставляет канонический адрес каталога', () => {
    const meta = searchPageMeta('дуб')

    expect(meta.title).toBe('Поиск: дуб')
    expect(meta.path).toBe('/catalog')
    expect(meta.description).not.toBe(pageCopy.catalog.description)
  })
})

describe('sitemap', () => {
  it('включает каталог, товары и статьи и не включает личные разделы', () => {
    const products = getProducts().map((product) => product.slug)
    const articles = journalArticles.map((article) => article.slug)
    const paths = buildSitemapPaths(products, articles)

    expect(paths).toContain('/')
    expect(paths).toContain('/catalog/stul-liniya')
    expect(paths).toContain('/journal/derevo-metall-tekstil')
    expect(paths).toContain('/about')
    expect(paths.some((path) => isPrivatePath(path))).toBe(false)
    expect(paths).not.toContain('/cart')
    expect(paths).not.toContain('/favorites')
    expect(paths).not.toContain('/checkout')
    expect(paths).not.toContain('/orders')

    for (const legacy of Object.keys(legacyArticleRedirects)) {
      expect(paths).not.toContain(`/journal/${legacy}`)
    }
  })

  it('читает те же slug, что каталог и журнал', () => {
    expect(slugsInSource(productSource)).toEqual(getProducts().map((product) => product.slug))
    expect(slugsInSource(journalSource)).toEqual(journalArticles.map((article) => article.slug))
  })

  it('оставляет место для публичного адреса и подставляет его, когда он задан', () => {
    const paths = ['/', '/catalog']

    expect(readSiteOrigin(siteSource)).toBe('')
    expect(renderSitemap(paths, '')).toContain('siteOrigin')
    expect(renderSitemap(paths, '')).toContain('<loc>/</loc>')
    expect(renderSitemap(paths, 'https://forma.example')).toContain(
      '<loc>https://forma.example/catalog</loc>',
    )
    expect(renderRobots('')).toContain('siteOrigin')
    expect(renderRobots('https://forma.example')).toContain(
      'Sitemap: https://forma.example/sitemap.xml',
    )
    expect(absoluteUrl('/journal', '')).toBe('/journal')
    expect(absoluteUrl('/journal', 'https://forma.example/')).toBe('https://forma.example/journal')
    expect(isAbsoluteOrigin('')).toBe(false)
    expect(isAbsoluteOrigin('https://')).toBe(false)
    expect(absoluteUrl('/catalog', 'https://')).toBe('/catalog')
    expect(absoluteUrl('/catalog', '   ')).toBe('/catalog')
    expect(renderSitemap(paths, '')).not.toContain('<loc>http')
    expect(renderSitemap(paths, 'https://')).toContain('<loc>/catalog</loc>')
    expect(renderSitemap(paths, 'https://')).not.toContain('https:///')
    expect(renderRobots('')).not.toMatch(/Sitemap:\s*https?:/)
    expect(renderRobots('https://')).not.toContain('https:///')
  })
})
