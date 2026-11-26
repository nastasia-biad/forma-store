export const CART_STORAGE_KEY = 'forma-cart-v1'

export const FAVORITES_STORAGE_KEY = 'forma-favorites-v1'

export type StoredCartLine = {
  productId: string
  quantity: number
}

export type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export type StoredRead<T> =
  | { status: 'ok'; value: T }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'unavailable' }

export type StorageWriteResult = 'saved' | 'unavailable' | 'failed'

export type StorageApplyResult<T> = {
  value: T
  applied: boolean
  issue: 'failed' | 'unavailable' | null
}

type FavoriteSource = {
  id: string
  isFavorite: boolean
}

export function browserStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }

    return window.localStorage
  } catch {
    return null
  }
}

export function subscribeStorage(key: string, onChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const onStorage = (event: StorageEvent) => {
    if (event.storageArea && event.storageArea !== window.localStorage) {
      return
    }

    if (event.key !== null && event.key !== key) {
      return
    }

    onChange()
  }

  window.addEventListener('storage', onStorage)

  return () => window.removeEventListener('storage', onStorage)
}

export function normalizeCartLines(
  lines: readonly StoredCartLine[],
  productIds: ReadonlySet<string>,
): StoredCartLine[] {
  const quantities = new Map<string, number>()
  const order: string[] = []

  for (const line of lines) {
    if (!isCartLine(line, productIds)) {
      continue
    }

    const current = quantities.get(line.productId)

    if (current === undefined) {
      order.push(line.productId)
      quantities.set(line.productId, line.quantity)
      continue
    }

    const sum = current + line.quantity
    quantities.set(line.productId, Number.isSafeInteger(sum) ? sum : Number.MAX_SAFE_INTEGER)
  }

  return order.map((productId) => ({
    productId,
    quantity: quantities.get(productId) ?? 1,
  }))
}

export function normalizeFavoriteIds(
  ids: readonly string[],
  productIds: ReadonlySet<string>,
): Set<string> {
  return new Set(ids.filter((id) => productIds.has(id)))
}

export function sameCartLines(
  left: readonly StoredCartLine[],
  right: readonly StoredCartLine[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (line, index) =>
        line.productId === right[index]?.productId && line.quantity === right[index]?.quantity,
    )
  )
}

export function sameFavoriteIds(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  if (left.size !== right.size) {
    return false
  }

  for (const id of left) {
    if (!right.has(id)) {
      return false
    }
  }

  return true
}

export function readCart(
  store: StorageLike,
  productIds: ReadonlySet<string>,
): StoredRead<StoredCartLine[]> {
  const raw = readStoredRaw(store, CART_STORAGE_KEY)

  if (raw.status !== 'ok') {
    return raw
  }

  const parsed = parseStoredJson(raw.value)

  if (!parsed.ok || !Array.isArray(parsed.value)) {
    return { status: 'invalid' }
  }

  const lines: StoredCartLine[] = []

  for (const item of parsed.value) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const record = item as Record<string, unknown>

    if (typeof record.productId !== 'string' || typeof record.quantity !== 'number') {
      continue
    }

    lines.push({ productId: record.productId, quantity: record.quantity })
  }

  return { status: 'ok', value: normalizeCartLines(lines, productIds) }
}

export function writeCart(
  store: StorageLike | null,
  lines: readonly StoredCartLine[],
): StorageWriteResult {
  return persistRaw(store, CART_STORAGE_KEY, JSON.stringify(lines))
}

export function readFavorites(
  store: StorageLike,
  productIds: ReadonlySet<string>,
): StoredRead<Set<string>> {
  const raw = readStoredRaw(store, FAVORITES_STORAGE_KEY)

  if (raw.status !== 'ok') {
    return raw
  }

  const parsed = parseStoredJson(raw.value)

  if (!parsed.ok || !Array.isArray(parsed.value)) {
    return { status: 'invalid' }
  }

  const ids = parsed.value.filter((item): item is string => typeof item === 'string')

  return { status: 'ok', value: normalizeFavoriteIds(ids, productIds) }
}

export function writeFavorites(
  store: StorageLike | null,
  ids: ReadonlySet<string>,
): StorageWriteResult {
  return persistRaw(store, FAVORITES_STORAGE_KEY, JSON.stringify([...ids].sort()))
}

export function applyStorageWrite<T>(
  current: T,
  next: T,
  result: StorageWriteResult,
): StorageApplyResult<T> {
  if (result === 'failed') {
    return { value: current, applied: false, issue: 'failed' }
  }

  if (result === 'unavailable') {
    return { value: next, applied: true, issue: 'unavailable' }
  }

  return { value: next, applied: true, issue: null }
}

export function loadInitialCart(
  productIds: ReadonlySet<string>,
  store: StorageLike | null = browserStorage(),
): StoredCartLine[] {
  if (!store) {
    return []
  }

  const loaded = readCart(store, productIds)

  return loaded.status === 'ok' ? loaded.value : []
}

export function loadInitialFavorites(
  products: readonly FavoriteSource[],
  productIds: ReadonlySet<string>,
  store: StorageLike | null = browserStorage(),
): Set<string> {
  const seeded = new Set(products.filter((product) => product.isFavorite).map((product) => product.id))

  if (!store) {
    return seeded
  }

  const loaded = readFavorites(store, productIds)

  if (loaded.status === 'ok') {
    return loaded.value
  }

  if (loaded.status === 'invalid') {
    return new Set()
  }

  return seeded
}

export function cartLinesFromRead(loaded: StoredRead<StoredCartLine[]>): StoredCartLine[] | null {
  if (loaded.status === 'unavailable') {
    return null
  }

  return loaded.status === 'ok' ? loaded.value : []
}

export function favoriteIdsFromRead(loaded: StoredRead<Set<string>>): Set<string> | null {
  if (loaded.status === 'unavailable') {
    return null
  }

  return loaded.status === 'ok' ? loaded.value : new Set()
}

function isCartLine(line: StoredCartLine, productIds: ReadonlySet<string>): boolean {
  return (
    typeof line.productId === 'string' &&
    productIds.has(line.productId) &&
    Number.isSafeInteger(line.quantity) &&
    line.quantity > 0
  )
}

export function readStoredRaw(
  store: StorageLike,
  key: string,
): { status: 'ok'; value: string } | { status: 'missing' } | { status: 'unavailable' } {
  try {
    const value = store.getItem(key)

    if (value === null) {
      return { status: 'missing' }
    }

    return { status: 'ok', value }
  } catch {
    return { status: 'unavailable' }
  }
}

export function persistRaw(
  store: StorageLike | null,
  key: string,
  value: string,
): StorageWriteResult {
  if (!store) {
    return 'unavailable'
  }

  return writeStoredRaw(store, key, value) ? 'saved' : 'failed'
}

export function writeStoredRaw(store: StorageLike, key: string, value: string): boolean {
  try {
    if (store.getItem(key) === value) {
      return true
    }

    store.setItem(key, value)
    return store.getItem(key) === value
  } catch {
    return false
  }
}

export function parseStoredJson(value: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(value) as unknown }
  } catch {
    return { ok: false }
  }
}
