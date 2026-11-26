import { useEffect, useMemo, useRef, useState } from 'react'
import { storageWriteFailedMessage, useStorageStatus } from '../app/storage-status.ts'
import type { Product } from '../types/product.ts'
import {
  FAVORITES_STORAGE_KEY,
  applyStorageWrite,
  browserStorage,
  favoriteIdsFromRead,
  loadInitialFavorites,
  normalizeFavoriteIds,
  readFavorites,
  sameFavoriteIds,
  subscribeStorage,
  writeFavorites,
} from '../utils/persistence.ts'

export function useFavoriteIds(products: readonly Product[]) {
  const productIds = useMemo(() => new Set(products.map((product) => product.id)), [products])
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(() =>
    loadInitialFavorites(products, productIds),
  )
  const favoriteIdsRef = useRef(favoriteIds)
  const { reportStorageIssue, clearStorageIssue } = useStorageStatus()

  useEffect(() => {
    favoriteIdsRef.current = favoriteIds
  }, [favoriteIds])

  useEffect(() => {
    return subscribeStorage(FAVORITES_STORAGE_KEY, () => {
      const store = browserStorage()

      if (!store) {
        return
      }

      const next = favoriteIdsFromRead(readFavorites(store, productIds))

      if (!next) {
        return
      }

      setFavoriteIds((current) => (sameFavoriteIds(current, next) ? current : next))
    })
  }, [productIds])

  const toggleFavorite = (id: string) => {
    const current = favoriteIdsRef.current
    const next = new Set(current)

    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }

    const normalized = normalizeFavoriteIds([...next], productIds)

    if (sameFavoriteIds(current, normalized)) {
      return
    }

    const decision = applyStorageWrite(current, normalized, writeFavorites(browserStorage(), normalized))

    if (decision.issue === 'failed') {
      reportStorageIssue(storageWriteFailedMessage)
      return
    }

    if (decision.issue === null) {
      clearStorageIssue()
    }

    favoriteIdsRef.current = decision.value
    setFavoriteIds(decision.value)
  }

  return { favoriteIds, toggleFavorite }
}
