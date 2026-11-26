import type { ReactNode } from 'react'
import { useStorageStatus } from '../../app/storage-status.ts'
import { Footer } from '../../components/Footer/index.ts'
import { Header } from '../../components/Header/index.ts'
import './MainLayout.css'

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { message, clearStorageIssue } = useStorageStatus()

  return (
    <div className="layout">
      <Header />
      {message ? (
        <div className="layout__notice" role="status">
          <div className="container layout__notice-inner">
            <p>{message}</p>
            <button type="button" onClick={clearStorageIssue}>
              Скрыть
            </button>
          </div>
        </div>
      ) : null}
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  )
}
