import { Link } from 'react-router'
import type { Product } from '../../types/product.ts'
import { formatPrice } from '../../utils/format.ts'
import { ProductPhoto } from '../ProductPhoto/ProductPhoto.tsx'
import './ProductCard.css'

type ProductCardProps = {
  product: Product
  onToggleFavorite: (id: string) => void
  loading?: 'eager' | 'lazy'
}

export function ProductCard({ product, onToggleFavorite, loading = 'lazy' }: ProductCardProps) {
  const image = product.images[0]

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link className="product-card__media-link" to={`/catalog/${product.slug}`}>
          {image ? (
            <ProductPhoto
              className="product-card__image"
              image={image}
              alt={product.name}
              presentation="card"
              loading={loading}
            />
          ) : null}
        </Link>

        <div className="product-card__badges">
          {product.isNew ? <span className="product-card__badge">Новинка</span> : null}
          {product.isBestseller ? (
            <span className="product-card__badge product-card__badge--accent">Бестселлер</span>
          ) : null}
        </div>

        <button
          className="product-card__favorite"
          type="button"
          aria-pressed={product.isFavorite}
          aria-label={
            product.isFavorite
              ? `Убрать «${product.name}» из избранного`
              : `Добавить «${product.name}» в избранное`
          }
          onClick={() => onToggleFavorite(product.id)}
        >
          <HeartIcon filled={product.isFavorite} />
        </button>
      </div>

      <div className="product-card__meta">
        <h3 className="product-card__name">
          <Link className="product-card__name-link" to={`/catalog/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="product-card__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        className={filled ? 'product-card__heart product-card__heart--filled' : 'product-card__heart'}
        d="M12 19.4c-.4-.3-6.4-4-6.4-8.2A3.3 3.3 0 0 1 12 8.4a3.3 3.3 0 0 1 6.4 2.8c0 4.2-6 7.9-6.4 8.2Z"
      />
    </svg>
  )
}
