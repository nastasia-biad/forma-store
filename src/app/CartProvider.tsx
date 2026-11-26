import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getProducts } from '../data/catalog.ts'
import { addCartItem, removeCartItem, setCartQuantity } from '../utils/cart.ts'
import {
  CART_STORAGE_KEY,
  applyStorageWrite,
  browserStorage,
  cartLinesFromRead,
  loadInitialCart,
  normalizeCartLines,
  readCart,
  sameCartLines,
  subscribeStorage,
  writeCart,
} from '../utils/persistence.ts'
import { CartContext, type CartLine } from './cart-context.ts'
import { storageWriteFailedMessage, useStorageStatus } from './storage-status.ts'

export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = getProducts()
  const productIds = useMemo(() => new Set(catalog.map((product) => product.id)), [catalog])
  const [lines, setLines] = useState<readonly CartLine[]>(() => loadInitialCart(productIds))
  const linesRef = useRef(lines)
  const { reportStorageIssue, clearStorageIssue } = useStorageStatus()

  useEffect(() => {
    linesRef.current = lines
  }, [lines])

  useEffect(() => {
    return subscribeStorage(CART_STORAGE_KEY, () => {
      const store = browserStorage()

      if (!store) {
        return
      }

      const next = cartLinesFromRead(readCart(store, productIds))

      if (!next) {
        return
      }

      setLines((current) => (sameCartLines(current, next) ? current : next))
    })
  }, [productIds])

  const commitLines = useCallback(
    (next: readonly CartLine[]) => {
      const current = linesRef.current

      if (sameCartLines(current, next)) {
        return true
      }

      const decision = applyStorageWrite(current, next, writeCart(browserStorage(), next))

      if (decision.issue === 'failed') {
        reportStorageIssue(storageWriteFailedMessage)
        return false
      }

      if (decision.issue === null) {
        clearStorageIssue()
      }

      linesRef.current = decision.value
      setLines(decision.value)
      return true
    },
    [clearStorageIssue, reportStorageIssue],
  )

  const addItem = useCallback(
    (productId: string, quantity: number) => {
      commitLines(
        normalizeCartLines(addCartItem(linesRef.current, productId, quantity), productIds),
      )
    },
    [commitLines, productIds],
  )

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      commitLines(
        normalizeCartLines(setCartQuantity(linesRef.current, productId, quantity), productIds),
      )
    },
    [commitLines, productIds],
  )

  const removeItem = useCallback(
    (productId: string) => {
      commitLines(normalizeCartLines(removeCartItem(linesRef.current, productId), productIds))
    },
    [commitLines, productIds],
  )

  const clearCart = useCallback(() => commitLines([]), [commitLines])

  const itemCount = useMemo(
    () => lines.reduce((total, line) => total + line.quantity, 0),
    [lines],
  )

  const value = useMemo(
    () => ({ lines, addItem, setQuantity, removeItem, clearCart, itemCount }),
    [addItem, clearCart, itemCount, lines, removeItem, setQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
