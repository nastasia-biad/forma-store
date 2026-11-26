import { findProductBySlug } from '../utils/catalog.ts'
import type { Product } from '../types/product.ts'
import { products } from './products.ts'

export function getProducts(): readonly Product[] {
  return products
}

export function getProductBySlug(slug: string): Product | undefined {
  return findProductBySlug(products, slug)
}

export function getProductsByIds(ids: readonly string[]): Product[] {
  const byId = new Map(products.map((product) => [product.id, product]))

  return ids.flatMap((id) => {
    const product = byId.get(id)
    return product ? [product] : []
  })
}
