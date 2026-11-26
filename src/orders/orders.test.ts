import { describe, expect, it } from 'vitest'
import type { CheckoutForm } from '../utils/checkout.ts'
import type { StorageLike } from '../utils/persistence.ts'
import {
  ORDER_HISTORY_STORAGE_KEY,
  findStoredOrder,
  readOrderHistory,
  rememberOrder,
  type StoredOrder,
} from './order-history.ts'
import { placeOrderInHistory, shouldClearCartAfter } from './orders.ts'

const form: CheckoutForm = {
  firstName: 'Анна',
  lastName: 'Соколова',
  email: 'anna@example.com',
  phone: '+7 555 010-20-30',
  country: 'Россия',
  city: 'Москва',
  street: 'Тверская',
  house: '1',
  apartment: '2',
  postalCode: '125009',
  comment: 'Позвоните заранее',
  delivery: 'express',
  payment: 'card',
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

function storedOrder(overrides: Partial<StoredOrder> = {}): StoredOrder {
  return {
    number: 'FM-KEEP',
    createdAt: '2026-01-15T09:00:00.000Z',
    lines: [{ productId: 'stul-liniya', quantity: 1, unitPrice: 24900 }],
    total: 24900,
    delivery: 'standard',
    payment: 'on-delivery',
    status: 'completed',
    ...overrides,
  }
}

describe('история заказов', () => {
  it('сохраняет несколько заказов и отдаёт историю с последнего', () => {
    const store = memoryStorage()
    const first = placeOrderInHistory(
      store,
      form,
      [{ productId: 'stul-liniya', quantity: 2 }],
      'FM-ONE',
      new Date('2026-03-01T12:00:00.000Z'),
    )
    const second = placeOrderInHistory(
      store,
      { ...form, delivery: 'standard', payment: 'on-delivery' },
      [{ productId: 'lampa-duga', quantity: 1 }],
      'FM-TWO',
      new Date('2026-03-02T15:30:00.000Z'),
    )

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)

    const history = readOrderHistory(store)

    expect(history.status).toBe('ok')

    if (history.status !== 'ok') {
      return
    }

    expect(history.value.map((order) => order.number)).toEqual(['FM-TWO', 'FM-ONE'])
    expect(history.value[1]).toMatchObject({
      createdAt: '2026-03-01T12:00:00.000Z',
      lines: [{ productId: 'stul-liniya', quantity: 2, unitPrice: 24900 }],
      total: 49800,
      delivery: 'express',
      payment: 'card',
      status: 'accepted',
    })
    expect(history.value[0]).toMatchObject({
      lines: [{ productId: 'lampa-duga', quantity: 1, unitPrice: 12900 }],
      total: 12900,
      status: 'accepted',
    })

    const raw = store.getItem(ORDER_HISTORY_STORAGE_KEY) ?? ''
    expect(raw).not.toContain('anna@example.com')
    expect(raw).not.toContain('Анна')
    expect(raw).not.toContain('Соколова')
    expect(raw).not.toContain('+7 555 010-20-30')
    expect(raw).not.toContain('Москва')
    expect(raw).not.toContain('Тверская')
    expect(raw).not.toContain('Позвоните')
  })

  it('находит заказ по номеру и возвращает null для неизвестного', () => {
    const store = memoryStorage()
    placeOrderInHistory(
      store,
      form,
      [{ productId: 'vaza-obyom', quantity: 1 }],
      'FM-VASE',
      new Date('2026-04-01T08:00:00.000Z'),
    )

    expect(findStoredOrder(store, 'FM-VASE')?.lines[0]?.unitPrice).toBe(4900)
    expect(findStoredOrder(store, 'FM-NONE')).toBeNull()
    expect(findStoredOrder(memoryStorage(), 'FM-VASE')).toBeNull()
  })

  it('не стирает повреждённые данные и пропускает некорректные записи', () => {
    const broken = memoryStorage({ [ORDER_HISTORY_STORAGE_KEY]: '{' })
    const before = broken.getItem(ORDER_HISTORY_STORAGE_KEY)

    expect(readOrderHistory(broken)).toEqual({ status: 'invalid' })
    expect(findStoredOrder(broken, 'FM-KEEP')).toBeNull()
    expect(broken.getItem(ORDER_HISTORY_STORAGE_KEY)).toBe(before)

    const valid = storedOrder()
    const mixed = memoryStorage({
      [ORDER_HISTORY_STORAGE_KEY]: JSON.stringify([
        valid,
        { number: 'FM-BAD', status: 'shipped' },
        { ...valid, number: 'FM-PRICE', total: 1 },
      ]),
    })
    const mixedRaw = mixed.getItem(ORDER_HISTORY_STORAGE_KEY)
    const history = readOrderHistory(mixed)

    expect(history).toEqual({ status: 'ok', value: [valid] })
    expect(mixed.getItem(ORDER_HISTORY_STORAGE_KEY)).toBe(mixedRaw)
    expect(valid.status).toBe('completed')
  })

  it('оставляет записанную отметку без смены по времени', () => {
    const store = memoryStorage()
    const saved = rememberOrder(store, storedOrder({ createdAt: '2020-01-01T00:00:00.000Z' }))

    expect(saved).toBe('saved')
    expect(findStoredOrder(store, 'FM-KEEP')?.status).toBe('completed')
  })

  it('не создаёт дубликат при повторном оформлении с тем же номером', () => {
    const store = memoryStorage()
    const lines = [{ productId: 'pled-pole', quantity: 1 }]
    const now = new Date('2026-05-01T10:00:00.000Z')
    const first = placeOrderInHistory(store, form, lines, 'FM-SAME', now)
    const snapshot = store.getItem(ORDER_HISTORY_STORAGE_KEY)
    const second = placeOrderInHistory(store, form, lines, 'FM-SAME', now)
    const history = readOrderHistory(store)

    expect(first).toEqual(second)
    expect(history.status === 'ok' && history.value).toHaveLength(1)
    expect(store.getItem(ORDER_HISTORY_STORAGE_KEY)).toBe(snapshot)
  })

  it('оставляет корзину нетронутой по контракту, если запись заказа не удалась', () => {
    const store = memoryStorage()
    placeOrderInHistory(
      store,
      form,
      [{ productId: 'zerkalo-rama', quantity: 1 }],
      'FM-KEPT',
      new Date('2026-06-01T10:00:00.000Z'),
    )
    const kept = store.getItem(ORDER_HISTORY_STORAGE_KEY)
    const blocked: StorageLike = {
      getItem: (key) => store.getItem(key),
      setItem() {
        throw new Error('Запись недоступна')
      },
    }
    const failed = placeOrderInHistory(
      blocked,
      form,
      [{ productId: 'stol-ploskost', quantity: 1 }],
      'FM-NEXT',
      new Date('2026-06-02T10:00:00.000Z'),
    )

    expect(failed).toEqual({ ok: false, reason: 'unavailable' })
    expect(shouldClearCartAfter(failed)).toBe(false)
    expect(store.getItem(ORDER_HISTORY_STORAGE_KEY)).toBe(kept)
    expect(findStoredOrder(store, 'FM-NEXT')).toBeNull()
    expect(findStoredOrder(store, 'FM-KEPT')?.total).toBe(16400)
  })

  it('не записывает заказ при недоступном хранилище', () => {
    const failed = placeOrderInHistory(
      null,
      form,
      [{ productId: 'stul-liniya', quantity: 1 }],
      'FM-OFF',
    )

    expect(failed.ok).toBe(false)
    expect(shouldClearCartAfter(failed)).toBe(false)
    expect(readOrderHistory(null)).toEqual({ status: 'unavailable' })
  })
})
