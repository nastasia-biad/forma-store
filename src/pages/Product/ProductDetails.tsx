import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { useCart } from '../../app/cart-context.ts'
import { useFavorites } from '../../app/favorites-context.ts'
import { ProductCard } from '../../components/ProductCard/index.ts'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import { colorSwatch } from '../../content/colors.ts'
import { getProductBySlug, getProducts } from '../../data/catalog.ts'
import { catalogHref } from '../Catalog/catalog-params.ts'
import { productCategories, type Product } from '../../types/product.ts'
import { getRelatedProducts, withFavorites } from '../../utils/catalog.ts'
import { deliveryOptions } from '../../utils/checkout.ts'
import { pageCopy, productPageMeta } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatItemCount, formatPrice } from '../../utils/format.ts'
import './ProductDetails.css'

export function ProductDetails() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const product = slug ? getProductBySlug(slug) : undefined
  usePageMeta(
    product
      ? productPageMeta(product)
      : { ...(slug ? pageCopy.missingProduct : pageCopy.missingPage), path: pathname },
  )

  if (!slug) {
    return <MissingPage title="Страница не найдена" text="Такого адреса в магазине нет." />
  }

  if (!product) {
    return <MissingPage title="Товар не найден" text="Этой позиции нет в коллекции." />
  }

  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }: { product: Product }) {
  const { favoriteIds, toggleFavorite } = useFavorites()
  const { addItem, lines } = useCart()
  const [imageIndex, setImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const imageCount = product.images.length
  const image = product.images[imageIndex]
  const swatch = colorSwatch(product.color)
  const isFavorite = favoriteIds.has(product.id)
  const inCart = lines.find((line) => line.productId === product.id)?.quantity ?? 0
  const showPrevious = () => setImageIndex((current) => (current - 1 + imageCount) % imageCount)
  const showNext = () => setImageIndex((current) => (current + 1) % imageCount)
  const related = useMemo(
    () => withFavorites(getRelatedProducts(getProducts(), product), favoriteIds),
    [favoriteIds, product],
  )

  return (
    <article className="product section">
      <div className="container product__inner">
        <nav className="product__crumbs" aria-label="Навигация по каталогу">
          <ol>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li>
              <Link to="/catalog">Каталог</Link>
            </li>
            <li>
              <Link to={catalogHref({ subcategory: product.subcategory })}>{product.subcategory}</Link>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="product__layout">
          <div
            className="product__gallery"
            tabIndex={imageCount > 1 ? 0 : undefined}
            onKeyDown={(event) => {
              if (imageCount < 2) {
                return
              }

              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                showPrevious()
              }

              if (event.key === 'ArrowRight') {
                event.preventDefault()
                showNext()
              }
            }}
          >
            <div className="product__frame">
              {image ? (
                <ProductPhoto
                  image={image}
                  alt={`${product.name}, фото ${imageIndex + 1} из ${imageCount}`}
                  presentation="hero"
                />
              ) : null}
              {imageCount > 1 ? (
                <div className="product__nav">
                  <button type="button" aria-label="Предыдущее фото" onClick={showPrevious}>
                    Назад
                  </button>
                  <button type="button" aria-label="Следующее фото" onClick={showNext}>
                    Дальше
                  </button>
                </div>
              ) : null}
            </div>
            {imageCount > 1 ? (
              <p className="product__note" aria-live="polite">
                Фото {imageIndex + 1} из {imageCount}
              </p>
            ) : null}

            {product.images.length > 0 ? (
              <ul className="product__thumbs">
                {product.images.map((item, index) => (
                  <li key={item.src}>
                    <button
                      className="product__thumb"
                      type="button"
                      aria-pressed={index === imageIndex}
                      aria-label={`Показать фото ${index + 1}`}
                      onClick={() => setImageIndex(index)}
                    >
                      <ProductPhoto
                        image={item}
                        alt=""
                        presentation="thumb"
                        full={index === imageIndex}
                        loading={index === imageIndex ? 'eager' : 'lazy'}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="product__info">
            <p className="product__kicker">
              {productCategories[product.category]}
              <span aria-hidden="true"> / </span>
              {product.subcategory}
            </p>
            <h1 className="product__title">{product.name}</h1>
            <p className="product__price">{formatPrice(product.price)}</p>

            <section className="product__description" aria-labelledby="product-description">
              <h2 id="product-description" className="product__label">
                Описание
              </h2>
              <p>{product.description}</p>
            </section>

            <section aria-labelledby="product-material">
              <h2 id="product-material" className="product__label">
                Материал и цвет
              </h2>
              <dl className="product__specs">
                <div className="product__spec">
                  <dt>Материал</dt>
                  <dd>{product.material}</dd>
                </div>
                <div className="product__spec">
                  <dt>Цвет</dt>
                  <dd className="product__color">
                    {swatch ? (
                      <span className="product__swatch" style={{ backgroundColor: swatch }} />
                    ) : null}
                    {product.color}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="product-size">
              <h2 id="product-size" className="product__label">
                Размеры
              </h2>
              <dl className="product__specs">
                <div className="product__spec">
                  <dt>Габариты</dt>
                  <dd>{product.dimensions}</dd>
                </div>
              </dl>
            </section>

            <div className="product__actions">
              <div className="product__quantity" role="group" aria-label="Количество">
                <button
                  className="product__step"
                  type="button"
                  aria-label="Уменьшить количество"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  −
                </button>
                <span className="product__qty" aria-live="polite">
                  {quantity}
                </span>
                <button
                  className="product__step"
                  type="button"
                  aria-label="Увеличить количество"
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="product__favorite"
                type="button"
                aria-pressed={isFavorite}
                onClick={() => toggleFavorite(product.id)}
              >
                {isFavorite ? 'В избранном' : 'В избранное'}
              </button>

              <button
                className="product__buy"
                type="button"
                onClick={() => addItem(product.id, quantity)}
              >
                Добавить в корзину
              </button>
            </div>

            {inCart > 0 ? (
              <p className="product__note">
                В корзине: {formatItemCount(inCart)}. <Link to="/cart">Открыть корзину</Link>
              </p>
            ) : null}

            <section className="product__service" aria-labelledby="product-service">
              <h2 id="product-service" className="product__label">
                Доставка и оплата
              </h2>
              <ul className="product__service-list">
                {deliveryOptions.map((option) => (
                  <li key={option.id}>
                    <span>{option.label}</span>
                    <span>{formatPrice(option.cost)}</span>
                  </li>
                ))}
              </ul>
              <p>
                Способ выбирается при оформлении, его стоимость входит в итог. Срок и район доставки в
                заказе не задаются.
              </p>
              <p>
                Оплата при получении или банковской картой. Карта на сайте не проводится, деньги не
                списываются.
              </p>
              <p>
                Подтверждение заказа сохраняется в этом браузере. Магазин не получает уведомление.
              </p>
              <p className="product__service-links">
                <Link to="/delivery">Доставка</Link>
                <Link to="/payment">Оплата</Link>
                <Link to="/returns">Возврат</Link>
              </p>
            </section>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="product__related" aria-labelledby="related-title">
            <h2 id="related-title" className="product__related-title">
              Похожие товары
            </h2>
            <ul className="product__related-grid">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} onToggleFavorite={toggleFavorite} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  )
}

function MissingPage({ title, text }: { title: string; text: string }) {
  return (
    <section className="product-missing section">
      <div className="container-narrow product-missing__inner">
        <p className="product__kicker">FORMA</p>
        <h1 className="product__title">{title}</h1>
        <p>{text}</p>
        <Link className="product__buy" to="/catalog">
          Вернуться в каталог
        </Link>
      </div>
    </section>
  )
}
