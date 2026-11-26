import { getProducts } from '../data/catalog.ts'
import {
  deliveryCost,
  placeDemoOrder,
  type CheckoutForm,
  type DemoOrderLine,
} from '../utils/checkout.ts'
import { browserStorage } from '../utils/persistence.ts'
import {
  createOrderNumber,
  findStoredOrder,
  readOrderHistory,
  rememberOrder,
  type StoredOrder,
} from './order-history.ts'

export type { StoredOrder }
export { createOrderNumber, demoOrderStatusLabels } from './order-history.ts'
export type { DemoOrderStatus } from './order-history.ts'

export type PlaceOrderResult =
  | { ok: true; order: StoredOrder }
  | { ok: false; reason: 'rejected' | 'unavailable' }

export type Orders = {
  listOrders(): StoredOrder[]
  findOrder(number: string): StoredOrder | null
  placeOrder(
    form: CheckoutForm,
    lines: readonly DemoOrderLine[],
    number?: string,
  ): PlaceOrderResult
}

export function shouldClearCartAfter(
  result: PlaceOrderResult,
): result is Extract<PlaceOrderResult, { ok: true }> {
  return result.ok
}

export function placeOrderInHistory(
  store: ReturnType<typeof browserStorage>,
  form: CheckoutForm,
  lines: readonly DemoOrderLine[],
  number = createOrderNumber(),
  now = new Date(),
): PlaceOrderResult {
  const draft = placeDemoOrder(form, lines)

  if (!draft) {
    return { ok: false, reason: 'rejected' }
  }

  const catalog = getProducts()
  const priced = lines.flatMap((line) => {
    const product = catalog.find((item) => item.id === line.productId)

    if (!product) {
      return []
    }

    return [
      {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: product.price,
      },
    ]
  })

  if (priced.length !== lines.length) {
    return { ok: false, reason: 'rejected' }
  }

  const existing = findStoredOrder(store, number)

  if (existing) {
    return { ok: true, order: existing }
  }

  const goods = priced.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const order: StoredOrder = {
    number,
    createdAt: now.toISOString(),
    lines: priced,
    total: goods + deliveryCost(draft.delivery),
    delivery: draft.delivery,
    payment: draft.payment,
    status: 'accepted',
  }

  const saved = rememberOrder(store, order)

  if (saved === 'duplicate') {
    const stored = findStoredOrder(store, number)
    return stored ? { ok: true, order: stored } : { ok: false, reason: 'unavailable' }
  }

  if (saved !== 'saved') {
    return { ok: false, reason: saved === 'rejected' ? 'rejected' : 'unavailable' }
  }

  return { ok: true, order }
}

export const localOrders: Orders = {
  listOrders() {
    const history = readOrderHistory(browserStorage())
    return history.status === 'ok' ? history.value : []
  },
  findOrder(number) {
    return findStoredOrder(browserStorage(), number)
  },
  placeOrder(form, lines, number) {
    return placeOrderInHistory(browserStorage(), form, lines, number)
  },
}
