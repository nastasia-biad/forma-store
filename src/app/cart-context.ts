import { createContext, useContext } from 'react'

export type CartLine = {
  productId: string
  quantity: number
}

export type CartValue = {
  lines: readonly CartLine[]
  addItem: (productId: string, quantity: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => boolean
  itemCount: number
}

export const CartContext = createContext<CartValue | null>(null)

export function useCart(): CartValue {
  const value = useContext(CartContext)

  if (!value) {
    throw new Error('useCart must be used within CartProvider')
  }

  return value
}
