import { Link } from 'react-router'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import { getProductsByIds } from '../../data/catalog.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import type { ProductImage } from '../../types/product.ts'
import './About.css'

export function AboutPage() {
  usePageMeta(pageCopy.about)
  const shelf = photo('stellazh-ritm', 0)
  const chair = photo('stul-liniya', 1)
  const table = photo('stol-ploskost', 1)
  const lamp = photo('lampa-duga', 0)
  const vase = photo('vaza-obyom', 1)
  const textile = photo('pled-pole', 1)
  const mirror = photo('zerkalo-rama', 0)
  const dresser = photo('komod-tishina', 0)

  return (
    <article className="about">
      <section className="about-hero section">
        <div className="container about-hero__grid">
          {shelf ? (
            <div className="about-hero__photo">
              <ProductPhoto image={shelf.image} alt={shelf.name} presentation="hero" />
            </div>
          ) : null}
          <div className="about-hero__copy">
            <p className="about__kicker">FORMA</p>
            <h1>Комната начинается с одной точной вещи</h1>
            <p>
              Мы собираем мебель, свет и предметы, у которых форма держит пространство раньше декора.
              Москва, интернет-магазин и шоурум.
            </p>
          </div>
        </div>
      </section>

      <section className="about-quote section" aria-label="Тезис">
        <div className="container">
          <blockquote>
            <p>Не комплект. Не сезон. Предмет, который можно рассмотреть вблизи.</p>
          </blockquote>
        </div>
      </section>

      <section className="section" aria-labelledby="about-approach">
        <div className="container about-split">
          <div className="about-copy">
            <p className="about__kicker">Подход</p>
            <h2 id="about-approach">Сначала кромка, шаг полки и шов</h2>
            <p>
              В коллекцию попадает то, что выдерживает взгляд с близкого расстояния. Толщина рамы,
              край столешницы, расстояние между полками и ткань без рисунка важнее громкого описания.
            </p>
            <p>
              FORMA не заполняет дом одинаковым набором. Стул, стол, стеллаж и комод могут стоять в
              одной комнате, но у каждого своя высота и своя задача. Рядом остаются лампа, ваза, плед
              и зеркало — отдельные решения, не приложение к гарнитуру.
            </p>
          </div>
          {chair ? (
            <figure className="about-figure">
              <ProductPhoto image={chair.image} alt={chair.name} presentation="card" />
              <figcaption>Стул «Линия». Дубовый каркас и ткань сиденья.</figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      <section className="section about-materials" id="materials" aria-labelledby="about-materials">
        <div className="container">
          <div className="about-materials__intro">
            <p className="about__kicker">Материалы</p>
            <h2 id="about-materials">Форма, пропорция, фактура</h2>
          </div>
          <div className="about-materials__grid">
            {table ? (
              <figure className="about-figure about-figure--wide">
                <ProductPhoto image={table.image} alt={table.name} presentation="card" />
                <figcaption>Светлый дуб. Низкая плоскость, тонкая кромка.</figcaption>
              </figure>
            ) : null}
            <div className="about-materials__stack">
              {lamp ? (
                <figure className="about-figure">
                  <ProductPhoto image={lamp.image} alt={lamp.name} presentation="card" />
                  <figcaption>Латунь и лён. Свет как линия.</figcaption>
                </figure>
              ) : null}
              {vase ? (
                <figure className="about-figure">
                  <ProductPhoto image={vase.image} alt={vase.name} presentation="card" />
                  <figcaption>Матовая керамика. Один объём на столе.</figcaption>
                </figure>
              ) : null}
            </div>
            <div className="about-copy">
              <p>
                Дуб оставляем читаемым: натуральный, светлый или тёплый. Шерсть и лён добавляют
                мягкость там, где дерево уже сказало достаточно. Керамика матовая, с живой
                неровностью. Латунь работает тонкой линией. Зеркало берём в деревянной раме, чтобы
                оно не спорило со стеной.
              </p>
              <p>
                Пропорция проверяется цифрой. Высота стола 38 см, комода 78 см, стеллажа 160 см при
                глубине 32 см. Эти различия держат комнату лучше, чем ряд одинаковых предметов.
                На карточке указаны материал, цвет и размеры конкретной вещи.
              </p>
              {textile ? (
                <figure className="about-figure about-figure--strip">
                  <ProductPhoto image={textile.image} alt={textile.name} presentation="card" />
                  <figcaption>Оливковая шерсть. Цвет без нового шкафа.</figcaption>
                </figure>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="about-thesis section">
        <div className="container about-thesis__inner">
          <p>Ясный силуэт. Честный материал. Место для воздуха вокруг.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="about-showroom">
        <div className="container about-split about-split--flip">
          {mirror ? (
            <figure className="about-figure">
              <ProductPhoto image={mirror.image} alt={mirror.name} presentation="card" />
              <figcaption>Зеркало «Рама». Тонкая дубовая кромка.</figcaption>
            </figure>
          ) : null}
          <div className="about-copy">
            <p className="about__kicker">Москва</p>
            <h2 id="about-showroom">Шоурум, где материал можно увидеть</h2>
            <p>
              Заказ оформляется на сайте. Дерево, ткань, керамику и свет можно посмотреть в шоуруме
              в Москве: фотография показывает характер, а кромка и цвет проверяются вживую.
            </p>
            <p>
              Сейчас на странице контактов указан город. Адрес, телефон, почта, часы и маршрут
              появятся там же.
            </p>
            <Link className="about__link" to="/contacts">
              Контакты
            </Link>
          </div>
        </div>
      </section>

      <section className="about-end section" aria-labelledby="about-next">
        <div className="container about-end__grid">
          {dresser ? (
            <figure className="about-figure about-end__photo">
              <ProductPhoto image={dresser.image} alt={dresser.name} presentation="card" />
              <figcaption>Комод «Тишина». Тёплый дуб и закрытый фасад.</figcaption>
            </figure>
          ) : null}
          <div className="about-end__copy">
            <h2 id="about-next">Дальше — конкретные вещи</h2>
            <p>Каталог, подборки и журнал продолжают разговор о форме уже на конкретных предметах.</p>
            <div className="about-end__links">
              <Link to="/catalog">Каталог</Link>
              <Link to="/#collections">Коллекции</Link>
              <Link to="/journal">Журнал</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

function photo(id: string, index: number): { name: string; image: ProductImage } | null {
  const product = getProductsByIds([id])[0]
  const image = product?.images[index]

  if (!product || !image) {
    return null
  }

  return { name: product.name, image }
}
