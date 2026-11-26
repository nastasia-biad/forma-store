import { useMemo } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../app/cart-context.ts'
import { useFavorites } from '../../app/favorites-context.ts'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import { ProductCard } from '../../components/ProductCard/index.ts'
import { getProducts, getProductsByIds } from '../../data/catalog.ts'
import { withFavorites } from '../../utils/catalog.ts'
import {
  getCartSuggestions,
  resolveCartLines,
  summarizeCart,
  type ResolvedCartLine,
} from '../../utils/cart.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatItemCount, formatPrice } from '../../utils/format.ts'
import './Cart.css'

export function Cart() {
  usePageMeta(pageCopy.cart)
  const { lines, setQuantity, removeItem, clearCart } = useCart()
  const { favoriteIds, toggleFavorite } = useFavorites()
  const catalog = getProducts()
  const resolvedLines = useMemo(() => resolveCartLines(catalog, lines), [catalog, lines])
  const summary = useMemo(() => summarizeCart(resolvedLines), [resolvedLines])
  const suggestions = useMemo(
    () => withFavorites(getCartSuggestions(catalog, lines), favoriteIds),
    [catalog, favoriteIds, lines],
  )

  return (
    <section className="cart section" aria-labelledby="cart-title">
      <div className="container cart__inner">
        <header className="cart__header">
          <p className="cart__kicker">FORMA</p>
          <h1 id="cart-title" className="cart__title">
            Корзина
          </h1>
        </header>

        {resolvedLines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="cart__layout">
            <div className="cart__list-wrap">
              <div className="cart__list-head">
                <p className="cart__count">{formatItemCount(summary.itemCount)}</p>
                <button className="cart__clear" type="button" onClick={clearCart}>
                  Очистить корзину
                </button>
              </div>

              <ul className="cart__list">
                {resolvedLines.map((line, index) => (
                  <CartLine
                    key={line.productId}
                    line={line}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onDecrease={() => setQuantity(line.productId, line.quantity - 1)}
                    onIncrease={() => setQuantity(line.productId, line.quantity + 1)}
                    onRemove={() => removeItem(line.productId)}
                  />
                ))}
              </ul>
            </div>

            <CartSummary
              itemCount={summary.itemCount}
              goodsTotal={summary.goodsTotal}
              total={summary.total}
            />
          </div>
        )}

        {suggestions.length > 0 ? (
          <section className="cart__suggestions" aria-labelledby="cart-suggestions-title">
            <h2 id="cart-suggestions-title" className="cart__suggestions-title">
              Возможно, вам понравится
            </h2>
            <ul className="cart__suggestions-grid">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} onToggleFavorite={toggleFavorite} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  )
}

function CartLine({
  line,
  loading,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  line: ResolvedCartLine
  loading: 'eager' | 'lazy'
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}) {
  const { product, quantity, lineTotal } = line
  const image = product.images[0]

  return (
    <li className="cart__line">
      <Link className="cart__photo" to={`/catalog/${product.slug}`} aria-label={product.name}>
        {image ? (
          <ProductPhoto image={image} alt="" presentation="thumb" loading={loading} />
        ) : null}
      </Link>

      <div className="cart__body">
      <div className="cart__line-copy">
        <h2 className="cart__name">
          <Link to={`/catalog/${product.slug}`}>{product.name}</Link>
        </h2>
        <p className="cart__unit">
          {formatPrice(product.price)}
          <span aria-hidden="true"> · </span>
          {product.material}
        </p>
      </div>

      <div className="cart__controls">
        <div className="cart__quantity" role="group" aria-label={`Количество: ${product.name}`}>
          <button
            className="cart__step"
            type="button"
            aria-label={`Уменьшить количество «${product.name}»`}
            disabled={quantity === 1}
            onClick={onDecrease}
          >
            −
          </button>
          <span className="cart__qty" aria-live="polite">
            {quantity}
          </span>
          <button
            className="cart__step"
            type="button"
            aria-label={`Увеличить количество «${product.name}»`}
            onClick={onIncrease}
          >
            +
          </button>
        </div>

        <p className="cart__line-total">{formatPrice(lineTotal)}</p>

        <button
          className="cart__remove"
          type="button"
          aria-label={`Удалить «${product.name}» из корзины`}
          onClick={onRemove}
        >
          Удалить
        </button>
      </div>
      </div>
    </li>
  )
}

function CartSummary({
  itemCount,
  goodsTotal,
  total,
}: {
  itemCount: number
  goodsTotal: number
  total: number
}) {
  return (
    <aside className="cart__summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className="cart__summary-title">
        Итого
      </h2>
      <dl className="cart__totals">
        <div className="cart__total">
          <dt>Товары</dt>
          <dd>{formatItemCount(itemCount)}</dd>
        </div>
        <div className="cart__total">
          <dt>Стоимость</dt>
          <dd>{formatPrice(goodsTotal)}</dd>
        </div>
        <div className="cart__total">
          <dt>Доставка</dt>
          <dd>
            <span>При оформлении</span>
            <span className="cart__shipping-note">
              Стандартная или ускоренная. Цена способа входит в итог заказа.
            </span>
          </dd>
        </div>
        <div className="cart__total cart__total--sum">
          <dt>Итого</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <Link className="cart__checkout" to="/checkout">
        Перейти к оформлению
      </Link>
      <p className="cart__shipping-note">
        Итог в корзине — стоимость товаров. Доставка добавится на следующем шаге.{' '}
        <Link to="/delivery">Как устроена доставка</Link>
      </p>
    </aside>
  )
}

function EmptyCart() {
  const shelf = getProductsByIds(['stellazh-ritm'])[0]
  const image = shelf?.images[0]

  return (
    <div className="cart-empty">
      {shelf && image ? (
        <Link className="cart-empty__photo" to={`/catalog/${shelf.slug}`}>
          <ProductPhoto image={image} alt={shelf.name} presentation="card" />
        </Link>
      ) : null}
      <p className="cart-empty__text">
        В корзине пока нет товаров. В каталоге можно выбрать мебель и предметы, затем вернуться сюда
        и изменить количество.
      </p>
      <Link className="cart__catalog" to="/catalog">
        Перейти в каталог
      </Link>
    </div>
  )
}
