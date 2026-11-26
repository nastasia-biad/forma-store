import { createContext, useContext } from 'react'
import type { useFavoriteIds } from '../hooks/useFavoriteIds.ts'

type FavoritesValue = ReturnType<typeof useFavoriteIds>

export const FavoritesContext = createContext<FavoritesValue | null>(null)

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext)

  if (!value) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }

  return value
}
