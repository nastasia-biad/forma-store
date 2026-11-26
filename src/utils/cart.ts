import type { Product } from '../types/product.ts'

type CartLineRef = {
  productId: string
  quantity: number
}

export type ResolvedCartLine = {
  productId: string
  quantity: number
  product: Product
  lineTotal: number
}

export type CartSummary = {
  itemCount: number
  goodsTotal: number
  shippingCost: number
  total: number
}

export function addCartItem(
  lines: readonly CartLineRef[],
  productId: string,
  quantity: number,
): readonly CartLineRef[] {
  if (quantity < 1) {
    return lines
  }

  const existing = lines.find((line) => line.productId === productId)

  if (!existing) {
    return [...lines, { productId, quantity }]
  }

  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line,
  )
}

export function setCartQuantity(
  lines: readonly CartLineRef[],
  productId: string,
  quantity: number,
): readonly CartLineRef[] {
  if (quantity < 1) {
    return lines
  }

  return lines.map((line) => (line.productId === productId ? { ...line, quantity } : line))
}

export function removeCartItem(
  lines: readonly CartLineRef[],
  productId: string,
): readonly CartLineRef[] {
  return lines.filter((line) => line.productId !== productId)
}

export function resolveCartLines(
  products: readonly Product[],
  lines: readonly CartLineRef[],
): ResolvedCartLine[] {
  return lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId)

    if (!product) {
      return []
    }

    return [
      {
        productId: line.productId,
        quantity: line.quantity,
        product,
        lineTotal: product.price * line.quantity,
      },
    ]
  })
}

export function summarizeCart(lines: readonly ResolvedCartLine[]): CartSummary {
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0)
  const goodsTotal = lines.reduce((total, line) => total + line.lineTotal, 0)
  const shippingCost = 0

  return {
    itemCount,
    goodsTotal,
    shippingCost,
    total: goodsTotal + shippingCost,
  }
}

export function getCartSuggestions(
  products: readonly Product[],
  lines: readonly CartLineRef[],
  limit = 3,
): Product[] {
  const selectedIds = new Set(lines.map((line) => line.productId))

  return products.filter((product) => !selectedIds.has(product.id)).slice(0, limit)
}
