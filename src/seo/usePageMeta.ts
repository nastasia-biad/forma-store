import { useEffect } from 'react'
import { absoluteUrl, isAbsoluteOrigin, siteOrigin } from '../content/site.ts'
import { defaultOgImage, fullTitle, type PageMeta } from './pages.ts'

function setMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  const selector = `meta[${attribute}="${key}"]`
  const current = document.head.querySelector(selector)

  if (!content) {
    current?.remove()
    return
  }

  const element = current ?? document.createElement('meta')
  element.setAttribute(attribute, key)
  element.setAttribute('content', content)

  if (!current) {
    document.head.appendChild(element)
  }
}

function setCanonical(href: string) {
  const current = document.head.querySelector('link[rel="canonical"]')
  const element = current ?? document.createElement('link')
  element.setAttribute('rel', 'canonical')
  element.setAttribute('href', href)

  if (!current) {
    document.head.appendChild(element)
  }
}

function pageOrigin(): string {
  if (isAbsoluteOrigin(siteOrigin)) {
    return siteOrigin.trim().replace(/\/$/, '')
  }

  return window.location.origin
}

export function usePageMeta(meta: PageMeta) {
  const { title, description, path, image, noindex } = meta

  useEffect(() => {
    const origin = pageOrigin()
    const url = absoluteUrl(path, origin)
    const imageUrl = absoluteUrl(image || defaultOgImage, origin)

    document.title = fullTitle(title)
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : null)
    setMeta('property', 'og:title', fullTitle(title))
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:locale', 'ru_RU')
    setMeta('property', 'og:site_name', 'FORMA')
    setCanonical(url)
  }, [description, image, noindex, path, title])
}
