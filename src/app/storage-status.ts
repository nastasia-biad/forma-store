import { createContext, useContext } from 'react'

export const storageUnavailableMessage =
  'Браузер не сохраняет корзину и избранное. В этой вкладке ими можно пользоваться, но после обновления страницы изменения исчезнут.'

export const storageWriteFailedMessage =
  'Не удалось сохранить изменение в браузере. Экран оставлен прежним, чтобы не показывать данные, которых нет в сохранённой копии.'

export type StorageStatusValue = {
  message: string | null
  reportStorageIssue: (message: string) => void
  clearStorageIssue: () => void
}

export const StorageStatusContext = createContext<StorageStatusValue | null>(null)

export function useStorageStatus(): StorageStatusValue {
  const value = useContext(StorageStatusContext)

  if (!value) {
    throw new Error('useStorageStatus must be used within StorageStatusProvider')
  }

  return value
}
