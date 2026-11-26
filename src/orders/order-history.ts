import type { DeliveryMethod, PaymentMethod } from '../utils/checkout.ts'
import { deliveryCost, deliveryOptions, paymentOptions } from '../utils/checkout.ts'
import {
  parseStoredJson,
  readStoredRaw,
  writeStoredRaw,
  type StorageLike,
  type StoredRead,
} from '../utils/persistence.ts'

export const ORDER_HISTORY_STORAGE_KEY = 'forma-orders-v1'

export const demoOrderStatuses = [
  'accepted',
  'packing',
  'handed-over',
  'completed',
  'cancelled',
] as const

export type DemoOrderStatus = (typeof demoOrderStatuses)[number]

export const demoOrderStatusLabels: Record<DemoOrderStatus, string> = {
  accepted: 'Принят',
  packing: 'Собирается',
  'handed-over': 'Передан в доставку',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

export type StoredOrderLine = {
  productId: string
  quantity: number
  unitPrice: number
}

export type StoredOrder = {
  number: string
  createdAt: string
  lines: StoredOrderLine[]
  total: number
  delivery: DeliveryMethod
  payment: PaymentMethod
  status: DemoOrderStatus
}

const deliveries = new Set<string>(deliveryOptions.map((option) => option.id))
const payments = new Set<string>(paymentOptions.map((option) => option.id))
const statuses = new Set<string>(demoOrderStatuses)

export function createOrderNumber(now = new Date()): string {
  return `FM-${now.getTime().toString(36).toUpperCase()}`
}

export function readOrderHistory(store: StorageLike | null): StoredRead<StoredOrder[]> {
  if (!store) {
    return { status: 'unavailable' }
  }

  const raw = readStoredRaw(store, ORDER_HISTORY_STORAGE_KEY)

  if (raw.status !== 'ok') {
    return raw
  }

  const parsed = parseStoredJson(raw.value)

  if (!parsed.ok) {
    return { status: 'invalid' }
  }

  const orders = normalizeHistory(parsed.value)

  if (!orders) {
    return { status: 'invalid' }
  }

  return { status: 'ok', value: orders }
}

export function findStoredOrder(
  store: StorageLike | null,
  number: string,
): StoredOrder | null {
  const history = readOrderHistory(store)

  if (history.status !== 'ok') {
    return null
  }

  return history.value.find((order) => order.number === number) ?? null
}

export function rememberOrder(
  store: StorageLike | null,
  order: StoredOrder,
): 'saved' | 'duplicate' | 'rejected' | 'unavailable' {
  const normalized = normalizeOrder(order)

  if (!store || !normalized) {
    return !normalized ? 'rejected' : 'unavailable'
  }

  const history = readOrderHistory(store)

  if (history.status === 'unavailable') {
    return 'unavailable'
  }

  const current = history.status === 'ok' ? history.value : []
  const existing = current.find((item) => item.number === normalized.number)

  if (existing) {
    return 'duplicate'
  }

  const next = [normalized, ...current]
  const saved = writeStoredRaw(store, ORDER_HISTORY_STORAGE_KEY, JSON.stringify(next))

  return saved ? 'saved' : 'unavailable'
}

function normalizeHistory(value: unknown): StoredOrder[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const orders: StoredOrder[] = []
  const seen = new Set<string>()

  for (const item of value) {
    const order = normalizeOrder(item)

    if (!order || seen.has(order.number)) {
      continue
    }

    seen.add(order.number)
    orders.push(order)
  }

  return orders
}

function normalizeOrder(value: unknown): StoredOrder | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const order = value as Partial<StoredOrder>

  if (!isOrderNumber(order.number) || !isTimestamp(order.createdAt)) {
    return null
  }

  if (!isDelivery(order.delivery) || !isPayment(order.payment) || !isStatus(order.status)) {
    return null
  }

  const lines = normalizeLines(order.lines)

  if (!lines) {
    return null
  }

  const goods = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const total = goods + deliveryCost(order.delivery)

  if (!isSafeMoney(order.total) || order.total !== total || !isSafeMoney(goods)) {
    return null
  }

  return {
    number: order.number,
    createdAt: order.createdAt,
    lines,
    total,
    delivery: order.delivery,
    payment: order.payment,
    status: order.status,
  }
}

function normalizeLines(value: unknown): StoredOrderLine[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const lines: StoredOrderLine[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      return null
    }

    const line = item as Partial<StoredOrderLine>

    if (!isProductId(line.productId) || !isQuantity(line.quantity) || !isSafeMoney(line.unitPrice)) {
      return null
    }

    const lineTotal = line.unitPrice * line.quantity

    if (!isSafeMoney(lineTotal)) {
      return null
    }

    lines.push({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })
  }

  return lines
}

function isOrderNumber(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 32
}

function isProductId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 80
}

function isTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const time = Date.parse(value)
  return Number.isFinite(time) && new Date(time).toISOString() === value
}

function isQuantity(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0
}

function isSafeMoney(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function isDelivery(value: unknown): value is DeliveryMethod {
  return typeof value === 'string' && deliveries.has(value)
}

function isPayment(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && payments.has(value)
}

function isStatus(value: unknown): value is DemoOrderStatus {
  return typeof value === 'string' && statuses.has(value)
}
