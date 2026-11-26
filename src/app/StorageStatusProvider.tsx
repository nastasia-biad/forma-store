import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { browserStorage } from '../utils/persistence.ts'
import {
  StorageStatusContext,
  storageUnavailableMessage,
  type StorageStatusValue,
} from './storage-status.ts'

export function StorageStatusProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(() =>
    browserStorage() ? null : storageUnavailableMessage,
  )

  const reportStorageIssue = useCallback((next: string) => {
    setMessage((current) => (current === next ? current : next))
  }, [])

  const clearStorageIssue = useCallback(() => {
    setMessage((current) => (current === null ? current : null))
  }, [])

  const value = useMemo<StorageStatusValue>(
    () => ({ message, reportStorageIssue, clearStorageIssue }),
    [clearStorageIssue, message, reportStorageIssue],
  )

  return <StorageStatusContext.Provider value={value}>{children}</StorageStatusContext.Provider>
}
