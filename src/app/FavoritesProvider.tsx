import type { ReactNode } from 'react'
import { getProducts } from '../data/catalog.ts'
import { useFavoriteIds } from '../hooks/useFavoriteIds.ts'
import { FavoritesContext } from './favorites-context.ts'

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const value = useFavoriteIds(getProducts())

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
