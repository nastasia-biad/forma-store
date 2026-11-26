import { useMemo } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../app/cart-context.ts'
import { useFavorites } from '../../app/favorites-context.ts'
import { ProductCard } from '../../components/ProductCard/index.ts'
import { getProducts } from '../../data/catalog.ts'
import { withFavorites } from '../../utils/catalog.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatItemCount } from '../../utils/format.ts'
import './Favorites.css'

export function Favorites() {
  usePageMeta(pageCopy.favorites)
  const { favoriteIds, toggleFavorite } = useFavorites()
  const { addItem } = useCart()
  const favoriteProducts = useMemo(
    () => withFavorites(
      getProducts().filter((product) => favoriteIds.has(product.id)),
      favoriteIds,
    ),
    [favoriteIds],
  )

  return (
    <section className="favorites section" aria-labelledby="favorites-title">
      <div className="container favorites__inner">
        {favoriteProducts.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <>
            <header className="favorites__header">
              <p className="favorites__kicker">FORMA</p>
              <h1 id="favorites-title" className="favorites__title">
                Избранное
              </h1>
              <p className="favorites__count">{formatItemCount(favoriteProducts.length)}</p>
            </header>

            <ul className="favorites__grid">
              {favoriteProducts.map((product, index) => (
                <li key={product.id} className="favorites__item">
                  <ProductCard
                    product={product}
                    onToggleFavorite={toggleFavorite}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <button
                    className="favorites__add"
                    type="button"
                    aria-label={`Добавить «${product.name}» в корзину`}
                    onClick={() => addItem(product.id, 1)}
                  >
                    В корзину
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

function EmptyFavorites() {
  return (
    <div className="favorites-empty">
      <div className="favorites-empty__stage" aria-hidden="true">
        <span className="favorites-empty__plane" />
        <span className="favorites-empty__column" />
        <HeartMark />
      </div>
      <h1 id="favorites-title" className="favorites__title">
        Здесь пока ничего нет
      </h1>
      <p className="favorites-empty__text">
        Отметьте вещи, к которым хочется вернуться. Они сохранятся в этом списке.
      </p>
      <Link className="favorites__catalog" to="/catalog">
        Перейти в каталог
      </Link>
    </div>
  )
}

function HeartMark() {
  return (
    <svg className="favorites-empty__mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19.4c-.4-.3-6.4-4-6.4-8.2A3.3 3.3 0 0 1 12 8.4a3.3 3.3 0 0 1 6.4 2.8c0 4.2-6 7.9-6.4 8.2Z" />
    </svg>
  )
}
