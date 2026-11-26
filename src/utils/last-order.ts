import { deliveryCost, type DeliveryMethod, type PaymentMethod } from './checkout.ts'
import { summarizeCart, resolveCartLines } from './cart.ts'
import type { Product } from '../types/product.ts'
import {
  browserStorage,
  normalizeCartLines,
  parseStoredJson,
  readStoredRaw,
  writeStoredRaw,
  type StorageLike,
  type StoredRead,
} from './persistence.ts'

export const LAST_ORDER_STORAGE_KEY = 'forma-last-order-v1'

export type StoredOrderLine = {
  productId: string
  quantity: number
}

export type StoredLastOrder = {
  number: string
  createdAt: string
  lines: StoredOrderLine[]
  total: number
  delivery: DeliveryMethod
  payment: PaymentMethod
}

function isDeliveryMethod(value: unknown): value is DeliveryMethod {
  return value === 'standard' || value === 'express'
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === 'on-delivery' || value === 'card'
}

export function saveLastOrder(
  store: StorageLike,
  order: StoredLastOrder,
  products: readonly Product[],
): boolean {
  const normalized = normalizeLastOrder(order, products)

  if (!normalized) {
    return false
  }

  return writeStoredRaw(store, LAST_ORDER_STORAGE_KEY, JSON.stringify(normalized))
}

export function readLastOrder(
  store: StorageLike,
  products: readonly Product[],
): StoredRead<StoredLastOrder> {
  const raw = readStoredRaw(store, LAST_ORDER_STORAGE_KEY)

  if (raw.status !== 'ok') {
    return raw
  }

  const parsed = parseStoredJson(raw.value)

  if (!parsed.ok || !parsed.value || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) {
    return { status: 'invalid' }
  }

  const order = normalizeLastOrder(parsed.value, products)

  return order ? { status: 'ok', value: order } : { status: 'invalid' }
}

export function loadLastOrder(
  products: readonly Product[],
  store: StorageLike | null = browserStorage(),
): StoredLastOrder | null {
  if (!store) {
    return null
  }

  const loaded = readLastOrder(store, products)

  return loaded.status === 'ok' ? loaded.value : null
}

export function orderTotal(
  products: readonly Product[],
  lines: readonly StoredOrderLine[],
  delivery: DeliveryMethod,
): number {
  return summarizeCart(resolveCartLines(products, lines)).goodsTotal + deliveryCost(delivery)
}

function normalizeLastOrder(value: unknown, products: readonly Product[]): StoredLastOrder | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const number = record.number
  const createdAt = record.createdAt
  const delivery = record.delivery
  const payment = record.payment
  const total = record.total

  if (typeof number !== 'string' || number.trim().length === 0 || number.length > 32) {
    return null
  }

  if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) {
    return null
  }

  if (!isDeliveryMethod(delivery) || !isPaymentMethod(payment)) {
    return null
  }

  if (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0) {
    return null
  }

  if (!Array.isArray(record.lines)) {
    return null
  }

  const candidates: StoredOrderLine[] = []

  for (const line of record.lines) {
    if (!line || typeof line !== 'object') {
      continue
    }

    const item = line as Record<string, unknown>

    if (typeof item.productId !== 'string' || typeof item.quantity !== 'number') {
      continue
    }

    candidates.push({ productId: item.productId, quantity: item.quantity })
  }

  const productIds = new Set(products.map((product) => product.id))
  const lines = normalizeCartLines(candidates, productIds)

  if (lines.length === 0 || total !== orderTotal(products, lines, delivery)) {
    return null
  }

  return {
    number: number.trim(),
    createdAt: new Date(createdAt).toISOString(),
    lines,
    total,
    delivery,
    payment,
  }
}
