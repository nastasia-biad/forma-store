import type { Product, ProductCategory } from '../types/product.ts'

export type CategoryFilter = 'all' | ProductCategory

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc'

export type CatalogFilters = {
  search: string
  category: CategoryFilter
  subcategory: string
  materials: readonly string[]
  colors: readonly string[]
  minPrice: number | null
  maxPrice: number | null
  onlyNew: boolean
  onlyBestseller: boolean
}

export type CatalogOptions = {
  subcategories: string[]
  materials: string[]
  colors: string[]
}

type PriceBound =
  | { status: 'empty' }
  | { status: 'valid'; value: number }
  | { status: 'invalid' }

export function filterByCategory(
  products: readonly Product[],
  category: CategoryFilter,
): Product[] {
  if (category === 'all') {
    return [...products]
  }

  return products.filter((product) => product.category === category)
}

export function catalogOptions(
  products: readonly Product[],
  category: CategoryFilter,
): CatalogOptions {
  const scoped = filterByCategory(products, category)

  return {
    subcategories: uniqueValues(scoped.map((product) => product.subcategory)),
    materials: uniqueValues(scoped.map((product) => product.material)),
    colors: uniqueValues(scoped.map((product) => product.color)),
  }
}

export function retainSelection(
  selected: readonly string[],
  available: readonly string[],
): string[] {
  const allowed = new Set(available)

  return selected.filter((item) => allowed.has(item))
}

export function toggleSelection(selected: readonly string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]
}

export function resolvePriceBounds(minRaw: string, maxRaw: string): {
  min: number | null
  max: number | null
  error: string | null
} {
  const min = parsePriceBound(minRaw)
  const max = parsePriceBound(maxRaw)

  if (min.status === 'invalid' || max.status === 'invalid') {
    return { min: null, max: null, error: 'Введите цену числом от 0' }
  }

  const minPrice = min.status === 'valid' ? min.value : null
  const maxPrice = max.status === 'valid' ? max.value : null

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return { min: null, max: null, error: 'Минимальная цена больше максимальной' }
  }

  return { min: minPrice, max: maxPrice, error: null }
}

export function filterCatalog(
  products: readonly Product[],
  filters: CatalogFilters,
): Product[] {
  const search = filters.search.trim().toLocaleLowerCase('ru-RU')

  return products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false
    }

    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false
    }

    if (filters.materials.length > 0 && !filters.materials.includes(textValue(product.material))) {
      return false
    }

    if (filters.colors.length > 0 && !filters.colors.includes(textValue(product.color))) {
      return false
    }

    if (filters.minPrice !== null && product.price < filters.minPrice) {
      return false
    }

    if (filters.maxPrice !== null && product.price > filters.maxPrice) {
      return false
    }

    if (filters.onlyNew && !product.isNew) {
      return false
    }

    if (filters.onlyBestseller && !product.isBestseller) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [product.name, product.description, product.material, product.color]
      .map((value) => textValue(value).toLocaleLowerCase('ru-RU'))
      .join('\n')

    return haystack.includes(search)
  })
}

export function sortProducts(products: readonly Product[], sort: SortOption): Product[] {
  const next = [...products]

  if (sort === 'price-asc') {
    next.sort((left, right) => left.price - right.price)
  }

  if (sort === 'price-desc') {
    next.sort((left, right) => right.price - left.price)
  }

  if (sort === 'newest') {
    next.sort((left, right) => Number(right.isNew) - Number(left.isNew))
  }

  return next
}

export function withFavorites(
  products: readonly Product[],
  favoriteIds: ReadonlySet<string>,
): Product[] {
  return products.map((product) => ({
    ...product,
    isFavorite: favoriteIds.has(product.id),
  }))
}

export function findProductBySlug(
  products: readonly Product[],
  slug: string,
): Product | undefined {
  return products.find((product) => product.slug === slug)
}

function uniqueValues(values: readonly (string | undefined)[]): string[] {
  const unique = new Set<string>()

  for (const value of values) {
    const text = textValue(value)

    if (text) {
      unique.add(text)
    }
  }

  return [...unique].sort((left, right) => left.localeCompare(right, 'ru'))
}

function textValue(value: string | undefined): string {
  return value?.trim() ?? ''
}

function parsePriceBound(value: string): PriceBound {
  const compact = value.trim().replace(/[\s\u00a0\u202f]/g, '')

  if (!compact) {
    return { status: 'empty' }
  }

  if (!/^\d+$/.test(compact)) {
    return { status: 'invalid' }
  }

  const price = Number(compact)

  if (!Number.isSafeInteger(price)) {
    return { status: 'invalid' }
  }

  return { status: 'valid', value: price }
}

export function getRelatedProducts(
  products: readonly Product[],
  product: Product,
  limit = 3,
): Product[] {
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit)
}
