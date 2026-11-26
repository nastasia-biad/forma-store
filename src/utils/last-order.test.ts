import { describe, expect, it } from 'vitest'
import type { Product, ProductImage } from '../types/product.ts'
import {
  LAST_ORDER_STORAGE_KEY,
  loadLastOrder,
  orderTotal,
  readLastOrder,
  saveLastOrder,
  type StoredLastOrder,
} from './last-order.ts'
import type { StorageLike } from './persistence.ts'

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
    category: 'accessories',
    subcategory: 'Керамика',
    description: 'Описание образца',
    images: [image],
    material: 'Керамика',
    color: 'Песочный',
    dimensions: '1 × 1 × 1 см',
    isFavorite: false,
    isNew: false,
    isBestseller: false,
  }
}

const chair = product('chair', 1000)
const table = product('table', 2500)
const catalog = [chair, table]

function order(overrides: Partial<StoredLastOrder> = {}): StoredLastOrder {
  return {
    number: 'FM-100001',
    createdAt: '2026-03-01T12:00:00.000Z',
    lines: [{ productId: 'chair', quantity: 2 }],
    total: 2000,
    delivery: 'standard',
    payment: 'on-delivery',
    ...overrides,
  }
}

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const items = new Map<string, string>(Object.entries(seed))

  return {
    getItem(key) {
      return items.get(key) ?? null
    },
    setItem(key, value) {
      items.set(key, value)
    },
  }
}

function rejectingStorage(seed: Record<string, string> = {}): StorageLike {
  const items = new Map<string, string>(Object.entries(seed))

  return {
    getItem(key) {
      return items.get(key) ?? null
    },
    setItem() {
      throw new Error('Запись недоступна')
    },
  }
}

function closedStorage(): StorageLike {
  return {
    getItem() {
      throw new Error('Хранилище недоступно')
    },
    setItem() {
      throw new Error('Хранилище недоступно')
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

describe('сохранение заказа', () => {
  it('сохраняет заказ и восстанавливает его', () => {
    const store = memoryStorage()
    const stored = order({ delivery: 'express', payment: 'card' })

    expect(saveLastOrder(store, stored, catalog)).toBe(true)
    expect(readLastOrder(store, catalog)).toEqual({ status: 'ok', value: stored })
    expect(loadLastOrder(catalog, store)).toEqual(stored)
  })

  it('считает ожидаемую сумму по известным товарам', () => {
    expect(
      orderTotal(
        catalog,
        [
          { productId: 'chair', quantity: 2 },
          { productId: 'missing', quantity: 5 },
        ],
        'express',
      ),
    ).toBe(2000)
  })

  it('не записывает имя, телефон и комментарий', () => {
    const store = memoryStorage()
    const payload = {
      ...order(),
      firstName: 'Анна',
      phone: '+79990000000',
      comment: 'не сохранять',
    }

    expect(saveLastOrder(store, payload, catalog)).toBe(true)

    const raw = store.getItem(LAST_ORDER_STORAGE_KEY)
    expect(typeof raw).toBe('string')

    if (typeof raw !== 'string') {
      return
    }

    const parsed: unknown = JSON.parse(raw)

    expect(isRecord(parsed)).toBe(true)

    if (!isRecord(parsed)) {
      return
    }

    expect(parsed.firstName).toBeUndefined()
    expect(parsed.phone).toBeUndefined()
    expect(parsed.comment).toBeUndefined()
    expect(parsed.number).toBe('FM-100001')
  })

  it('обрезает пробелы в номере и приводит дату к ISO', () => {
    const store = memoryStorage()

    expect(
      saveLastOrder(
        store,
        order({ number: '  FM-TRIM  ', createdAt: '2026-03-01T15:00:00.000+03:00' }),
        catalog,
      ),
    ).toBe(true)
    expect(readLastOrder(store, catalog)).toEqual({
      status: 'ok',
      value: order({ number: 'FM-TRIM', createdAt: '2026-03-01T12:00:00.000Z' }),
    })
  })
})

describe('восстановление заказа', () => {
  it('возвращает отсутствие записи, если заказа нет', () => {
    const store = memoryStorage()

    expect(readLastOrder(store, catalog)).toEqual({ status: 'missing' })
    expect(loadLastOrder(catalog, store)).toBeNull()
    expect(loadLastOrder(catalog, null)).toBeNull()
  })

  it('отклоняет некорректный JSON и не стирает его', () => {
    const store = memoryStorage({ [LAST_ORDER_STORAGE_KEY]: '{' })

    expect(readLastOrder(store, catalog)).toEqual({ status: 'invalid' })
    expect(loadLastOrder(catalog, store)).toBeNull()
    expect(store.getItem(LAST_ORDER_STORAGE_KEY)).toBe('{')
  })

  it('отклоняет данные заказа без обязательных полей', () => {
    const store = memoryStorage({
      [LAST_ORDER_STORAGE_KEY]: JSON.stringify({ number: 'FM-1' }),
    })

    expect(readLastOrder(store, catalog)).toEqual({ status: 'invalid' })
  })

  it('отклоняет пустой номер, неверную дату, доставку и оплату', () => {
    const samples = [
      order({ number: '   ' }),
      order({ number: 'F'.repeat(33) }),
      order({ createdAt: 'вчера' }),
      { ...order(), delivery: 'pickup' },
      { ...order(), payment: 'cash' },
    ]

    for (const sample of samples) {
      const store = memoryStorage({ [LAST_ORDER_STORAGE_KEY]: JSON.stringify(sample) })

      expect(readLastOrder(store, catalog)).toEqual({ status: 'invalid' })
    }
  })

  it('принимает номер длиной 32 символа', () => {
    const store = memoryStorage()
    const stored = order({ number: 'F'.repeat(32) })

    expect(saveLastOrder(store, stored, catalog)).toBe(true)
    expect(loadLastOrder(catalog, store)?.number).toBe('F'.repeat(32))
  })

  it('игнорирует личные поля при чтении и не перезаписывает хранилище', () => {
    const stored = {
      ...order(),
      firstName: 'Анна',
      address: 'ул. Пример',
    }
    const raw = JSON.stringify(stored)
    const store = memoryStorage({ [LAST_ORDER_STORAGE_KEY]: raw })
    const loaded = readLastOrder(store, catalog)

    expect(loaded).toEqual({ status: 'ok', value: order() })
    expect(store.getItem(LAST_ORDER_STORAGE_KEY)).toBe(raw)
  })
})

describe('состав и сумма заказа', () => {
  it('не сохраняет заказ без допустимых товаров', () => {
    const store = memoryStorage()

    expect(saveLastOrder(store, order({ lines: [], total: 0 }), catalog)).toBe(false)
    expect(
      saveLastOrder(
        store,
        order({ lines: [{ productId: 'missing', quantity: 2 }], total: 0 }),
        catalog,
      ),
    ).toBe(false)
    expect(
      saveLastOrder(store, order({ lines: [{ productId: 'chair', quantity: 0 }], total: 0 }), catalog),
    ).toBe(false)
    expect(store.getItem(LAST_ORDER_STORAGE_KEY)).toBeNull()
  })

  it('убирает неизвестный товар, если сумма сходится по оставшимся', () => {
    const store = memoryStorage()
    const stored = order({
      lines: [
        { productId: 'chair', quantity: 2 },
        { productId: 'missing', quantity: 9 },
      ],
    })

    expect(saveLastOrder(store, stored, catalog)).toBe(true)
    expect(readLastOrder(store, catalog)).toEqual({
      status: 'ok',
      value: order(),
    })
  })

  it('убирает некорректное количество и складывает одинаковые товары', () => {
    const store = memoryStorage()

    expect(
      saveLastOrder(
        store,
        order({
          lines: [
            { productId: 'chair', quantity: 1.5 },
            { productId: 'chair', quantity: 1 },
            { productId: 'chair', quantity: 1 },
          ],
        }),
        catalog,
      ),
    ).toBe(true)
    expect(loadLastOrder(catalog, store)?.lines).toEqual([{ productId: 'chair', quantity: 2 }])
  })

  it('отклоняет заказ, если сумма не совпадает', () => {
    const store = memoryStorage()

    expect(saveLastOrder(store, order({ total: 1999 }), catalog)).toBe(false)
    expect(saveLastOrder(store, order({ total: 2000.5 }), catalog)).toBe(false)
    expect(saveLastOrder(store, order({ total: -1 }), catalog)).toBe(false)
    expect(readLastOrder(store, catalog)).toEqual({ status: 'missing' })
  })
})

describe('ошибка сохранения заказа', () => {
  it('не заменяет предыдущий заказ, если новый заказ некорректен', () => {
    const store = memoryStorage()
    const previous = order()

    expect(saveLastOrder(store, previous, catalog)).toBe(true)

    const raw = store.getItem(LAST_ORDER_STORAGE_KEY)

    expect(saveLastOrder(store, order({ number: 'FM-NEW', total: 1 }), catalog)).toBe(false)
    expect(store.getItem(LAST_ORDER_STORAGE_KEY)).toBe(raw)
    expect(readLastOrder(store, catalog)).toEqual({ status: 'ok', value: previous })
  })

  it('не заменяет предыдущий заказ, если запись не удалась', () => {
    const store = memoryStorage()
    const previous = order()
    const replacement = order({
      number: 'FM-200002',
      lines: [{ productId: 'table', quantity: 1 }],
      total: 2500,
      payment: 'card',
    })

    expect(saveLastOrder(store, previous, catalog)).toBe(true)

    const raw = store.getItem(LAST_ORDER_STORAGE_KEY)
    const locked = rejectingStorage(
      raw === null ? {} : { [LAST_ORDER_STORAGE_KEY]: raw },
    )

    expect(saveLastOrder(locked, replacement, catalog)).toBe(false)
    expect(locked.getItem(LAST_ORDER_STORAGE_KEY)).toBe(raw)
    expect(readLastOrder(locked, catalog)).toEqual({ status: 'ok', value: previous })
  })

  it('возвращает недоступность хранилища и не подставляет заказ', () => {
    expect(readLastOrder(closedStorage(), catalog)).toEqual({ status: 'unavailable' })
    expect(loadLastOrder(catalog, closedStorage())).toBeNull()
    expect(loadLastOrder(catalog, null)).toBeNull()
  })
})
