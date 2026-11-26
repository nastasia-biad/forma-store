import { describe, expect, it } from 'vitest'
import {
  CART_STORAGE_KEY,
  applyStorageWrite,
  browserStorage,
  cartLinesFromRead,
  loadInitialCart,
  readCart,
  writeCart,
  type StorageLike,
  type StoredCartLine,
} from './persistence.ts'

const chairId = 'chair'
const tableId = 'table'
const productIds = new Set([chairId, tableId])

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

function discardingStorage(): StorageLike {
  return {
    getItem() {
      return null
    },
    setItem() {
      return undefined
    },
  }
}

describe('сохранение корзины', () => {
  it('сохраняет строки и восстанавливает их', () => {
    const store = memoryStorage()
    const lines: StoredCartLine[] = [
      { productId: chairId, quantity: 2 },
      { productId: tableId, quantity: 1 },
    ]

    expect(writeCart(store, lines)).toBe('saved')
    expect(readCart(store, productIds)).toEqual({ status: 'ok', value: lines })
    expect(loadInitialCart(productIds, store)).toEqual(lines)
  })

  it('повторная запись тех же данных остаётся успешной', () => {
    const lines: StoredCartLine[] = [{ productId: chairId, quantity: 1 }]
    const store = rejectingStorage({ [CART_STORAGE_KEY]: JSON.stringify(lines) })

    expect(writeCart(store, lines)).toBe('saved')
    expect(store.getItem(CART_STORAGE_KEY)).toBe(JSON.stringify(lines))
  })

  it('очищает корзину пустым списком', () => {
    const store = memoryStorage()

    writeCart(store, [{ productId: chairId, quantity: 2 }])

    expect(writeCart(store, [])).toBe('saved')
    expect(readCart(store, productIds)).toEqual({ status: 'ok', value: [] })
  })
})

describe('восстановление корзины', () => {
  it('возвращает пустую корзину, если записи нет', () => {
    const store = memoryStorage()

    expect(readCart(store, productIds)).toEqual({ status: 'missing' })
    expect(loadInitialCart(productIds, store)).toEqual([])
    expect(cartLinesFromRead(readCart(store, productIds))).toEqual([])
  })

  it('отклоняет некорректный JSON и не бросает исключение', () => {
    const store = memoryStorage({ [CART_STORAGE_KEY]: '{' })

    expect(readCart(store, productIds)).toEqual({ status: 'invalid' })
    expect(loadInitialCart(productIds, store)).toEqual([])
    expect(store.getItem(CART_STORAGE_KEY)).toBe('{')
  })

  it('отклоняет данные, которые не являются списком строк', () => {
    const store = memoryStorage({ [CART_STORAGE_KEY]: JSON.stringify({ productId: chairId }) })

    expect(readCart(store, productIds)).toEqual({ status: 'invalid' })
    expect(cartLinesFromRead(readCart(store, productIds))).toEqual([])
  })

  it('пропускает пустые и повреждённые элементы списка', () => {
    const store = memoryStorage({
      [CART_STORAGE_KEY]: JSON.stringify([
        null,
        'chair',
        { productId: 5, quantity: 1 },
        { productId: chairId },
        { productId: chairId, quantity: '2' },
        { productId: tableId, quantity: 1, name: 'Стол' },
      ]),
    })

    expect(readCart(store, productIds)).toEqual({
      status: 'ok',
      value: [{ productId: tableId, quantity: 1 }],
    })
  })

  it('убирает неизвестные товары', () => {
    const store = memoryStorage({
      [CART_STORAGE_KEY]: JSON.stringify([
        { productId: 'missing', quantity: 4 },
        { productId: chairId, quantity: 1 },
      ]),
    })

    expect(readCart(store, productIds)).toEqual({
      status: 'ok',
      value: [{ productId: chairId, quantity: 1 }],
    })
  })

  it('убирает некорректные количества и складывает повторы', () => {
    const store = memoryStorage({
      [CART_STORAGE_KEY]: JSON.stringify([
        { productId: chairId, quantity: 0 },
        { productId: chairId, quantity: -2 },
        { productId: chairId, quantity: 1.5 },
        { productId: tableId, quantity: 1 },
        { productId: tableId, quantity: 2 },
      ]),
    })

    expect(readCart(store, productIds)).toEqual({
      status: 'ok',
      value: [{ productId: tableId, quantity: 3 }],
    })
  })
})

describe('ошибки хранилища', () => {
  it('считает отсутствующий localStorage недоступным', () => {
    expect(browserStorage()).toBeNull()
    expect(writeCart(null, [{ productId: chairId, quantity: 1 }])).toBe('unavailable')
    expect(loadInitialCart(productIds, null)).toEqual([])
  })

  it('не бросает исключение, если чтение хранилища завершилось ошибкой', () => {
    const loaded = readCart(closedStorage(), productIds)

    expect(loaded).toEqual({ status: 'unavailable' })
    expect(cartLinesFromRead(loaded)).toBeNull()
    expect(loadInitialCart(productIds, closedStorage())).toEqual([])
  })

  it('сообщает об ошибке записи и сохраняет прежние данные', () => {
    const previous: StoredCartLine[] = [{ productId: chairId, quantity: 2 }]
    const raw = JSON.stringify(previous)
    const store = rejectingStorage({ [CART_STORAGE_KEY]: raw })

    expect(writeCart(store, [])).toBe('failed')
    expect(store.getItem(CART_STORAGE_KEY)).toBe(raw)
    expect(readCart(store, productIds)).toEqual({ status: 'ok', value: previous })
  })

  it('сообщает об ошибке, если после записи прочитано другое значение', () => {
    const store = discardingStorage()

    expect(writeCart(store, [{ productId: chairId, quantity: 1 }])).toBe('failed')
    expect(store.getItem(CART_STORAGE_KEY)).toBeNull()
  })

  it('оставляет текущие строки, если запись не удалась', () => {
    const current: StoredCartLine[] = [{ productId: chairId, quantity: 2 }]
    const decision = applyStorageWrite(current, [], 'failed')

    expect(decision.value).toBe(current)
    expect(decision.applied).toBe(false)
    expect(decision.issue).toBe('failed')
  })

  it('обновляет значение в памяти, если хранилище недоступно', () => {
    const current: StoredCartLine[] = [{ productId: chairId, quantity: 2 }]

    expect(applyStorageWrite(current, [], 'unavailable')).toEqual({
      value: [],
      applied: true,
      issue: 'unavailable',
    })
  })

  it('принимает новое значение после успешной записи', () => {
    const current: StoredCartLine[] = [{ productId: chairId, quantity: 2 }]
    const next: StoredCartLine[] = []

    expect(applyStorageWrite(current, next, 'saved')).toEqual({
      value: next,
      applied: true,
      issue: null,
    })
  })
})
