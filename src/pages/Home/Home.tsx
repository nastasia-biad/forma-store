import { Link } from 'react-router'
import { useFavorites } from '../../app/favorites-context.ts'
import { ProductCard } from '../../components/ProductCard/index.ts'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import {
  advantages,
  categoryCount,
  collectionBanners,
  journalArticles,
  shopCategories,
  type CollectionBanner,
  type ShopCategory,
} from '../../content/store.ts'
import { getProducts, getProductsByIds } from '../../data/catalog.ts'
import { catalogHref } from '../Catalog/catalog-params.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { withFavorites } from '../../utils/catalog.ts'
import './Home.css'

const catalog = getProducts()
const heroProduct = getProductsByIds(['stellazh-ritm'])[0]

export function Home() {
  usePageMeta(pageCopy.home)
  const { favoriteIds, toggleFavorite } = useFavorites()
  const newest = withFavorites(
    catalog.filter((product) => product.isNew),
    favoriteIds,
  )
  const popular = withFavorites(
    catalog.filter((product) => product.isBestseller),
    favoriteIds,
  )
  const categories = shopCategories.filter((category) => categoryCount(catalog, category) > 0)
  const [oak, light, ceramic] = collectionBanners

  return (
    <div className="home">
      <section className="hero section" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="home__kicker">FORMA</p>
            <h1 id="hero-title">Мебель и предметы, которые оставляют комнате воздух</h1>
            <p className="hero__lead">
              Дуб, шерсть, керамика и тихий свет. Коллекция собрана вокруг ясной формы, а не вокруг
              сезонного шума.
            </p>
            <div className="hero__actions">
              <Link className="home__button" to="/catalog">
                Перейти в каталог
              </Link>
              <Link className="home__text-link" to="/#collections">
                Смотреть коллекции
              </Link>
            </div>
          </div>
          {heroProduct?.images[0] ? (
            <div className="hero__photo">
              <ProductPhoto
                image={heroProduct.images[0]}
                alt="Стеллаж «Ритм» в интерьере"
                presentation="hero"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <header className="home__header">
            <p className="home__kicker">Каталог</p>
            <h2 id="categories-title">Разделы магазина</h2>
          </header>
          <ul className="home-cats">
            {categories.map((category) => (
              <li key={category.id} className={category.lead ? 'home-cats__lead' : undefined}>
                <CategoryTile category={category} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section home__band" aria-labelledby="new-title">
        <div className="container">
          <header className="home__header home__header--row">
            <div>
              <p className="home__kicker">Сейчас в коллекции</p>
              <h2 id="new-title">Новинки</h2>
            </div>
            <Link className="home__text-link" to={catalogHref({ new: '1' })}>
              Все новинки
            </Link>
          </header>
          <ul className="home-products">
            {newest.map((product, index) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  onToggleFavorite={toggleFavorite}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {oak ? <CollectionWide banner={oak} /> : null}

      <section className="section" aria-labelledby="popular-title">
        <div className="container">
          <header className="home__header home__header--row">
            <div>
              <p className="home__kicker">Выбор</p>
              <h2 id="popular-title">Популярное</h2>
            </div>
            <Link className="home__text-link" to={catalogHref({ bestseller: '1' })}>
              Все бестселлеры
            </Link>
          </header>
          <ul className="home-products">
            {popular.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} onToggleFavorite={toggleFavorite} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="collections" aria-labelledby="collections-title">
        <div className="container">
          <header className="home__header">
            <p className="home__kicker">Подборки</p>
            <h2 id="collections-title">Коллекции</h2>
          </header>
          <div className="home-split">
            {light ? <CollectionCard banner={light} /> : null}
            {ceramic ? <CollectionCard banner={ceramic} /> : null}
          </div>
        </div>
      </section>

      <section className="section home__band" id="about" aria-labelledby="about-title">
        <div className="container home-about">
          <div>
            <p className="home__kicker">О FORMA</p>
            <h2 id="about-title">Сначала пропорция, потом украшение</h2>
          </div>
          <div className="home-about__copy">
            <p>
              Мы выбираем предметы, которые можно поставить в комнату и не объяснять. Форма должна
              читаться с порога, материал — с близкого расстояния, функция — в повседневном жесте:
              сесть, положить, открыть, включить свет.
            </p>
            <p>
              Дуб остаётся деревом, керамика — глиной, шерсть — тёплой плоскостью. Рядом с ними не
              нужен шум. Достаточно точного размера и честного цвета.
            </p>
            <Link className="home__text-link" to="/about">
              О компании
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="journal-title">
        <div className="container">
          <header className="home__header home__header--row">
            <div>
              <p className="home__kicker">Журнал</p>
              <h2 id="journal-title">Как собрать комнату из нескольких вещей</h2>
            </div>
            <Link className="home__text-link" to="/journal">
              Все заметки
            </Link>
          </header>
          <ul className="home-notes">
            {journalArticles.slice(0, 3).map((article) => (
              <li key={article.slug}>
                <article className="home-note">
                  <h3>
                    <Link to={`/journal/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p>{article.excerpt}</p>
                  <Link className="home__text-link" to={`/journal/${article.slug}`}>
                    Читать
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section home__band" aria-labelledby="advantages-title">
        <div className="container">
          <header className="home__header">
            <p className="home__kicker">Покупателям</p>
            <h2 id="advantages-title">Что важно до и после заказа</h2>
          </header>
          <ul className="home-points">
            {advantages.map((item, index) => (
              <li key={item.href}>
                <p className="home-points__index">0{index + 1}</p>
                <h3>
                  <Link to={item.href}>{item.title}</Link>
                </h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function CategoryTile({ category }: { category: ShopCategory }) {
  const product = getProductsByIds([category.productId])[0]
  const image = product?.images[category.imageIndex] ?? product?.images[0]

  return (
    <Link className="home-cat" to={category.href}>
      {image ? (
        <img
          src={image.preview}
          alt=""
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="home-cat__fallback" />
      )}
      <span className="home-cat__copy">
        <span className="home-cat__title">{category.title}</span>
        <span className="home-cat__meta">{category.text}</span>
      </span>
    </Link>
  )
}

function CollectionWide({ banner }: { banner: CollectionBanner }) {
  return (
    <section className="section" aria-labelledby={`${banner.id}-title`}>
      <div className="container">
        <article className="home-banner">
          <BannerImage banner={banner} />
          <div className="home-banner__copy">
            <p className="home__kicker">{banner.kicker}</p>
            <h2 id={`${banner.id}-title`}>{banner.title}</h2>
            <p>{banner.text}</p>
            <Link className="home__button" to={banner.href}>
              {banner.action}
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}

function CollectionCard({ banner }: { banner: CollectionBanner }) {
  return (
    <article className="home-banner home-banner--stack">
      <BannerImage banner={banner} />
      <div className="home-banner__copy">
        <p className="home__kicker">{banner.kicker}</p>
        <h3>{banner.title}</h3>
        <p>{banner.text}</p>
        <Link className="home__text-link" to={banner.href}>
          {banner.action}
        </Link>
      </div>
    </article>
  )
}

function BannerImage({ banner }: { banner: CollectionBanner }) {
  const product = getProductsByIds([banner.productId])[0]
  const image = product?.images[banner.imageIndex] ?? product?.images[0]

  if (!image) {
    return <span className="home-cat__fallback" />
  }

  return (
    <img
      src={image.preview}
      alt=""
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
    />
  )
}
