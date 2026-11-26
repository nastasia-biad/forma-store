import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { CartProvider } from './app/CartProvider.tsx'
import { FavoritesProvider } from './app/FavoritesProvider.tsx'
import { StorageStatusProvider } from './app/StorageStatusProvider.tsx'
import { MainLayout } from './layouts/MainLayout/index.ts'
import { Cart } from './pages/Cart/index.ts'
import { Catalog } from './pages/Catalog/index.ts'
import { Checkout } from './pages/Checkout/index.ts'
import { Favorites } from './pages/Favorites/index.ts'
import { Home } from './pages/Home/index.ts'
import { AboutPage } from './pages/About/index.ts'
import { JournalPage } from './pages/Journal/index.ts'
import { OrderPage, OrdersPage } from './pages/Orders/index.ts'
import { ProductDetails } from './pages/Product/index.ts'
import { StorePage } from './pages/Store/index.ts'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))

      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <StorageStatusProvider>
        <FavoritesProvider>
          <CartProvider>
            <ScrollToTop />
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:slug" element={<ProductDetails />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/delivery" element={<StorePage pageId="delivery" />} />
                <Route path="/payment" element={<StorePage pageId="payment" />} />
                <Route path="/returns" element={<StorePage pageId="returns" />} />
                <Route path="/contacts" element={<StorePage pageId="contacts" />} />
                <Route path="/faq" element={<StorePage pageId="faq" />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/:slug" element={<JournalPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:orderNumber" element={<OrderPage />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="*" element={<ProductDetails />} />
              </Routes>
            </MainLayout>
          </CartProvider>
        </FavoritesProvider>
      </StorageStatusProvider>
    </BrowserRouter>
  )
}
