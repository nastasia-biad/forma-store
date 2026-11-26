import { Link, Navigate, useParams } from 'react-router'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import {
  findArticle,
  journalArticles,
  legacyArticleRedirects,
  type JournalArticle,
  type JournalBlock,
  type JournalImage,
} from '../../content/journal.ts'
import { getProductsByIds } from '../../data/catalog.ts'
import { articlePageMeta, pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import type { Product, ProductImage } from '../../types/product.ts'
import './Journal.css'

const journalPicks = ['stol-ploskost', 'lampa-duga', 'pled-pole', 'vaza-obyom'] as const

export function JournalPage() {
  const { slug } = useParams()
  const article = slug ? findArticle(slug) : undefined
  const cover = article ? findPhoto(article.coverProductId, article.coverImageIndex) : null
  usePageMeta(
    !slug
      ? pageCopy.journal
      : article
        ? articlePageMeta(article, cover?.image.src)
        : { ...pageCopy.missingArticle, path: `/journal/${slug}` },
  )

  if (!slug) {
    return <JournalIndex />
  }

  const redirected = legacyArticleRedirects[slug]

  if (redirected) {
    return <Navigate to={`/journal/${redirected}`} replace />
  }

  if (!article) {
    return (
      <article className="journal section">
        <div className="container-narrow journal__inner">
          <p className="journal__kicker">Журнал</p>
          <h1>Заметка не найдена</h1>
          <p className="journal__lead">Такой записи в журнале FORMA нет.</p>
          <Link className="journal__back" to="/journal">
            Все заметки
          </Link>
        </div>
      </article>
    )
  }

  return <JournalArticleView article={article} />
}

function JournalIndex() {
  const [feature, light, proportion, calm, lasting] = journalArticles

  return (
    <div className="journal">
      <section className="journal-open section">
        <div className="container journal-open__grid">
          <div>
            <p className="journal__kicker">Журнал</p>
            <h1>Как собрать комнату, не заполняя её</h1>
          </div>
          <p className="journal__lead">
            Пять заметок о дереве, свете, пропорциях и предметах, которые остаются. Каждая ведёт к
            вещам, которые уже есть в коллекции.
          </p>
        </div>
      </section>

      {feature ? <FeatureStory article={feature} /> : null}

      <section className="section" aria-labelledby="journal-paths">
        <div className="container">
          <h2 id="journal-paths" className="journal__kicker">
            Направления
          </h2>
          <div className="journal-paths">
            {light ? <PathCard article={light} mode="row" /> : null}
            {proportion ? <PathCard article={proportion} mode="quote" /> : null}
            {calm ? <PathCard article={calm} mode="tall" /> : null}
            {lasting ? <PathCard article={lasting} mode="band" /> : null}
          </div>
        </div>
      </section>

      <section className="section journal-picks" aria-labelledby="journal-picks">
        <div className="container">
          <header className="journal-picks__head">
            <h2 id="journal-picks">Предметы, о которых журнал</h2>
            <Link className="journal__back" to="/catalog">
              Весь каталог
            </Link>
          </header>
          <ul className="journal-picks__list">
            {journalPicks.map((id) => {
              const product = getProductsByIds([id])[0]
              const image = product?.images[0]

              if (!product || !image) {
                return null
              }

              return (
                <li key={product.id}>
                  <Link to={`/catalog/${product.slug}`}>
                    <ProductPhoto image={image} alt="" presentation="card" />
                    <span>{product.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </div>
  )
}

function FeatureStory({ article }: { article: JournalArticle }) {
  const cover = findPhoto(article.coverProductId, article.coverImageIndex)

  return (
    <section className="journal-feature section">
      <div className="container journal-feature__grid">
        {cover ? (
          <Link className="journal-feature__photo" to={`/journal/${article.slug}`}>
            <ProductPhoto image={cover.image} alt="" presentation="hero" />
          </Link>
        ) : null}
        <div className="journal-feature__copy">
          <p className="journal__kicker">{article.kicker}</p>
          <h2>
            <Link to={`/journal/${article.slug}`}>{article.title}</Link>
          </h2>
          <p>{article.excerpt}</p>
          <Link className="journal__back" to={`/journal/${article.slug}`}>
            Читать заметку
          </Link>
        </div>
      </div>
    </section>
  )
}

function PathCard({
  article,
  mode,
}: {
  article: JournalArticle
  mode: 'row' | 'quote' | 'tall' | 'band'
}) {
  const cover = findPhoto(article.coverProductId, article.coverImageIndex)

  return (
    <article className={`journal-path journal-path--${mode}`}>
      {cover && mode !== 'quote' ? (
        <Link className="journal-path__photo" to={`/journal/${article.slug}`}>
          <ProductPhoto image={cover.image} alt="" presentation="card" />
        </Link>
      ) : null}
      <div>
        <p className="journal__kicker">{article.kicker}</p>
        <h3>
          <Link to={`/journal/${article.slug}`}>{article.title}</Link>
        </h3>
        <p>{article.excerpt}</p>
      </div>
    </article>
  )
}

function JournalArticleView({ article }: { article: JournalArticle }) {
  const cover = findPhoto(article.coverProductId, article.coverImageIndex)
  const linked = getProductsByIds(article.productIds)

  return (
    <article className={`journal journal--${article.layout}`}>
      <header className="journal-article section">
        <div className="container journal-article__hero">
          <div className="journal-article__intro">
            <nav className="journal__crumbs" aria-label="Навигация">
              <ol>
                <li>
                  <Link to="/">Главная</Link>
                </li>
                <li>
                  <Link to="/journal">Журнал</Link>
                </li>
                <li aria-current="page">{article.title}</li>
              </ol>
            </nav>
            <p className="journal__kicker">{article.kicker}</p>
            <h1>{article.title}</h1>
            <p className="journal__lead">{article.excerpt}</p>
          </div>
          {cover ? (
            <figure className="journal-article__cover">
              <ProductPhoto image={cover.image} alt={cover.product.name} presentation="hero" />
              <figcaption>{cover.product.name}</figcaption>
            </figure>
          ) : null}
        </div>
      </header>
      <div className="section journal-article__body">
        <div className="container journal-blocks">
          {article.blocks.map((block, index) => (
            <ArticleBlock key={block.heading} block={block} index={index} />
          ))}
        </div>
      </div>
      <footer className="section">
        <div className="container journal-foot">
          {linked.length > 0 ? (
            <section aria-labelledby="journal-products">
              <h2 id="journal-products">Из коллекции</h2>
              <ul className="journal-products">
                {linked.map((product) => {
                  const image = product.images[0]
                  return (
                    <li key={product.id}>
                      <Link to={`/catalog/${product.slug}`}>
                        {image ? <ProductPhoto image={image} alt="" presentation="thumb" /> : null}
                        <span>{product.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
          <ul className="journal-categories">
            {article.categories.map((category) => (
              <li key={category.href}>
                <Link to={category.href}>{category.label}</Link>
              </li>
            ))}
          </ul>
          <Link className="journal__back" to="/journal">
            Все заметки
          </Link>
        </div>
      </footer>
    </article>
  )
}

function ArticleBlock({ block, index }: { block: JournalBlock; index: number }) {
  const photo = block.image ? findPhoto(block.image.productId, block.image.imageIndex) : null

  return (
    <section className="journal-block">
      <div className="journal-block__copy">
        <p className="journal-block__index">0{index + 1}</p>
        <h2>{block.heading}</h2>
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {block.quote ? <blockquote className="journal-block__quote">{block.quote}</blockquote> : null}
      {photo && block.image ? <Figure photo={photo} image={block.image} /> : null}
    </section>
  )
}

function Figure({
  photo,
  image,
}: {
  photo: { product: Product; image: ProductImage }
  image: JournalImage
}) {
  return (
    <figure className="journal-block__figure">
      <Link to={`/catalog/${photo.product.slug}`}>
        <ProductPhoto image={photo.image} alt={photo.product.name} presentation="card" />
      </Link>
      <figcaption>{image.caption}</figcaption>
    </figure>
  )
}

function findPhoto(
  productId: string,
  imageIndex: number,
): { product: Product; image: ProductImage } | null {
  const product = getProductsByIds([productId])[0]
  const image = product?.images[imageIndex]

  if (!product || !image) {
    return null
  }

  return { product, image }
}
