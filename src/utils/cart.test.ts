import { describe, expect, it } from 'vitest'
import type { Product, ProductImage } from '../types/product.ts'
import { addCartItem, removeCartItem, resolveCartLines, setCartQuantity, summarizeCart } from './cart.ts'
import { normalizeCartLines } from './persistence.ts'

type Line = {
  productId: string
  quantity: number
}

const image: ProductImage = {
  src: 'sample.webp',
  preview: 'sample-960.webp',
  width: 1152,
  height: 864,
}

function product(id: string, price: number): Product {
  return {
    id,
    name: id,
    slug: id,
    price,
    category: 'furniture',
    subcategory: 'Стулья',
    description: 'Описание образца',
    images: [image],
    material: 'Дуб',
    color: 'Белый',
    dimensions: '1 × 1 × 1 см',
    isFavorite: false,
    isNew: false,
    isBestseller: false,
  }
}

const chair = product('chair', 1000)
const table = product('table', 2500)
const catalog = [chair, table]
const knownIds = new Set(catalog.map((item) => item.id))

describe('добавление товара', () => {
  it('добавляет новый товар отдельной строкой', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 1 }]

    expect(addCartItem(lines, 'table', 2)).toEqual([
      { productId: 'chair', quantity: 1 },
      { productId: 'table', quantity: 2 },
    ])
  })

  it('увеличивает количество уже добавленного товара', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 1 }]

    expect(addCartItem(lines, 'chair', 2)).toEqual([{ productId: 'chair', quantity: 3 }])
  })

  it('не добавляет неизвестный товар', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 1 }]

    expect(normalizeCartLines(addCartItem(lines, 'missing', 2), knownIds)).toEqual([
      { productId: 'chair', quantity: 1 },
    ])
  })
})

describe('количество', () => {
  it('увеличивает количество выбранной позиции', () => {
    const lines: Line[] = [
      { productId: 'chair', quantity: 1 },
      { productId: 'table', quantity: 1 },
    ]

    expect(setCartQuantity(lines, 'chair', 4)).toEqual([
      { productId: 'chair', quantity: 4 },
      { productId: 'table', quantity: 1 },
    ])
  })

  it('уменьшает количество выбранной позиции', () => {
    const lines: Line[] = [
      { productId: 'chair', quantity: 4 },
      { productId: 'table', quantity: 1 },
    ]

    expect(setCartQuantity(lines, 'chair', 2)).toEqual([
      { productId: 'chair', quantity: 2 },
      { productId: 'table', quantity: 1 },
    ])
  })

  it('разрешает минимальное количество 1', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 3 }]

    expect(setCartQuantity(lines, 'chair', 1)).toEqual([{ productId: 'chair', quantity: 1 }])
  })

  it('не меняет корзину при добавлении меньше одной штуки', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 2 }]

    expect(addCartItem(lines, 'table', 0)).toBe(lines)
    expect(addCartItem(lines, 'chair', -1)).toBe(lines)
  })

  it('не опускает существующую позицию ниже 1', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 2 }]

    expect(setCartQuantity(lines, 'chair', 0)).toBe(lines)
    expect(setCartQuantity(lines, 'chair', -3)).toBe(lines)
  })

  it('отбрасывает дробное и неположительное количество при нормализации', () => {
    const ids = new Set(['chair', 'table'])

    expect(
      normalizeCartLines(
        [
          { productId: 'chair', quantity: 1.5 },
          { productId: 'table', quantity: 0 },
          { productId: 'chair', quantity: -2 },
          { productId: 'table', quantity: 2 },
        ],
        ids,
      ),
    ).toEqual([{ productId: 'table', quantity: 2 }])
  })

  it('не добавляет позицию, которой нет в корзине, через изменение количества', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 2 }]

    expect(setCartQuantity(lines, 'table', 3)).toEqual([{ productId: 'chair', quantity: 2 }])
  })
})

describe('удаление и очистка', () => {
  it('удаляет выбранный товар и сохраняет остальные', () => {
    const lines: Line[] = [
      { productId: 'chair', quantity: 1 },
      { productId: 'table', quantity: 2 },
    ]

    expect(removeCartItem(lines, 'chair')).toEqual([{ productId: 'table', quantity: 2 }])
  })

  it('очищенная корзина не содержит строк и имеет нулевые итоги', () => {
    expect(removeCartItem([{ productId: 'chair', quantity: 2 }], 'chair')).toEqual([])
    expect(summarizeCart(resolveCartLines(catalog, []))).toEqual({
      itemCount: 0,
      goodsTotal: 0,
      shippingCost: 0,
      total: 0,
    })
  })
})

describe('итоги', () => {
  it('считает количество единиц, а не число строк', () => {
    const resolved = resolveCartLines(catalog, [
      { productId: 'chair', quantity: 2 },
      { productId: 'table', quantity: 1 },
    ])

    expect(summarizeCart(resolved).itemCount).toBe(3)
  })

  it('считает сумму по цене и количеству, доставка остаётся нулевой', () => {
    const resolved = resolveCartLines(catalog, [
      { productId: 'chair', quantity: 2 },
      { productId: 'table', quantity: 1 },
    ])

    expect(resolved.map((line) => line.lineTotal)).toEqual([2000, 2500])
    expect(summarizeCart(resolved)).toEqual({
      itemCount: 3,
      goodsTotal: 4500,
      shippingCost: 0,
      total: 4500,
    })
  })

  it('не учитывает неизвестный товар в количестве и сумме', () => {
    const resolved = resolveCartLines(catalog, [
      { productId: 'chair', quantity: 2 },
      { productId: 'missing', quantity: 5 },
    ])

    expect(resolved.map((line) => line.productId)).toEqual(['chair'])
    expect(summarizeCart(resolved)).toEqual({
      itemCount: 2,
      goodsTotal: 2000,
      shippingCost: 0,
      total: 2000,
    })
  })
})

describe('исходные данные корзины', () => {
  it('не изменяет исходные строки при добавлении, изменении и удалении', () => {
    const line = { productId: 'chair', quantity: 1 }
    const lines = [line, { productId: 'table', quantity: 2 }]
    const snapshot: Line[] = [
      { productId: 'chair', quantity: 1 },
      { productId: 'table', quantity: 2 },
    ]

    addCartItem(lines, 'chair', 1)
    setCartQuantity(lines, 'table', 1)
    removeCartItem(lines, 'chair')

    expect(lines).toEqual(snapshot)
    expect(line).toEqual({ productId: 'chair', quantity: 1 })
  })

  it('не изменяет каталог и строки при расчёте итогов', () => {
    const lines: Line[] = [{ productId: 'chair', quantity: 2 }]
    const products = [chair]

    const resolved = resolveCartLines(products, lines)
    summarizeCart(resolved)

    expect(products).toEqual([chair])
    expect(resolved[0]?.product).toBe(chair)
    expect(lines).toEqual([{ productId: 'chair', quantity: 2 }])
  })
})
