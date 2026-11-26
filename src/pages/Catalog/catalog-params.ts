import type { CategoryFilter, SortOption } from '../../utils/catalog.ts'

const sortOptions = ['featured', 'newest', 'price-asc', 'price-desc'] as const

export type CatalogQuery = {
  search: string
  category: CategoryFilter
  subcategory: string
  materials: string[]
  colors: string[]
  minPrice: string
  maxPrice: string
  onlyNew: boolean
  onlyBestseller: boolean
  sort: SortOption
}

export function readCatalogQuery(params: URLSearchParams): CatalogQuery {
  const category = params.get('category')
  const sort = params.get('sort')

  return {
    search: params.get('search') ?? '',
    category: category === 'furniture' || category === 'accessories' ? category : 'all',
    subcategory: params.get('subcategory')?.trim() ?? '',
    materials: uniqueParams(params, 'material'),
    colors: uniqueParams(params, 'color'),
    minPrice: params.get('min') ?? '',
    maxPrice: params.get('max') ?? '',
    onlyNew: params.get('new') === '1',
    onlyBestseller: params.get('bestseller') === '1',
    sort: isSortOption(sort) ? sort : 'featured',
  }
}

export function replaceList(params: URLSearchParams, key: string, values: readonly string[]): void {
  params.delete(key)

  for (const value of values) {
    params.append(key, value)
  }
}

export function catalogHref(values: Record<string, string | readonly string[]>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(values)) {
    const items = typeof value === 'string' ? [value] : value

    for (const item of items) {
      if (item.trim()) {
        params.append(key, item)
      }
    }
  }

  const query = params.toString()

  return query ? `/catalog?${query}` : '/catalog'
}

function uniqueParams(params: URLSearchParams, key: string): string[] {
  const seen = new Set<string>()
  const values: string[] = []

  for (const value of params.getAll(key)) {
    const trimmed = value.trim()

    if (!trimmed || seen.has(trimmed)) {
      continue
    }

    seen.add(trimmed)
    values.push(trimmed)
  }

  return values
}

function isSortOption(value: string | null): value is SortOption {
  return sortOptions.some((option) => option === value)
}
