import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import {
  buildSitemapPaths,
  readSiteOrigin,
  renderRobots,
  renderSitemap,
  slugsInSource,
} from './src/seo/sitemap.ts'

function formaSeoFiles(): Plugin {
  const root = process.cwd()

  const files = () => {
    const productSlugs = slugsInSource(readFileSync(resolve(root, 'src/data/products.ts'), 'utf8'))
    const articleSlugs = slugsInSource(readFileSync(resolve(root, 'src/content/journal.ts'), 'utf8'))
    const origin = readSiteOrigin(readFileSync(resolve(root, 'src/content/site.ts'), 'utf8'))
    const paths = buildSitemapPaths(productSlugs, articleSlugs)

    return {
      sitemap: renderSitemap(paths, origin),
      robots: renderRobots(origin),
    }
  }

  return {
    name: 'forma-seo-files',
    buildStart() {
      const { sitemap, robots } = files()
      writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap)
      writeFileSync(resolve(root, 'public/robots.txt'), robots)
    },
  }
}

// Корневой 404.html не создаётся: на Cloudflare Pages он отключает
// отдачу index.html для адресов вроде /catalog и /journal/slug.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), formaSeoFiles()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
