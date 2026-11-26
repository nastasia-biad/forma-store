import { Link } from 'react-router'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import {
  publishedContacts,
  storePages,
  type StoreContact,
  type StoreFigure,
  type StorePageId,
} from '../../content/store.ts'
import { getProductsByIds } from '../../data/catalog.ts'
import { deliveryOptions, paymentOptions } from '../../utils/checkout.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatPrice } from '../../utils/format.ts'
import './StorePage.css'

type StorePageProps = {
  pageId: StorePageId
}

export function StorePage({ pageId }: StorePageProps) {
  usePageMeta(pageCopy[pageId])
  const page = storePages[pageId]
  const contacts = pageId === 'contacts' ? publishedContacts() : []

  return (
    <article className="store section">
      <div className="container-narrow store__inner">
        <nav className="store__crumbs" aria-label="Навигация">
          <ol>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li aria-current="page">{page.kicker}</li>
          </ol>
        </nav>
        <p className="store__kicker">{page.kicker}</p>
        <h1>{page.title}</h1>
        <p className="store__lead">{page.lead}</p>

        {page.figures ? <StoreFigures figures={page.figures} /> : null}
        {page.showOptions === 'delivery' ? <DeliveryOptions /> : null}
        {page.showOptions === 'payment' ? <PaymentOptions /> : null}

        {contacts.length > 0 ? (
          <dl className="store__contacts">
            {contacts.map((contact) => (
              <div key={contact.id}>
                <dt>{contact.label}</dt>
                <dd>
                  <ContactValue contact={contact} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {page.sections.map((section) => (
          <section key={section.heading} id={section.id} className="store__section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        {page.questions ? (
          <div className="store__faq">
            {page.questions.map((item) => (
              <details key={item.question} className="store__question">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        ) : null}

        <ul className="store__links">
          {page.links.map((link) => (
            <li key={link.href}>
              <Link to={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function StoreFigures({ figures }: { figures: StoreFigure[] }) {
  return (
    <ul className="store__figures">
      {figures.map((figure) => {
        const product = getProductsByIds([figure.productId])[0]
        const image = product?.images[figure.imageIndex]

        if (!product || !image) {
          return null
        }

        return (
          <li key={figure.caption}>
            <Link to={`/catalog/${product.slug}`}>
              <ProductPhoto image={image} alt={product.name} presentation="card" />
            </Link>
            <p>{figure.caption}</p>
          </li>
        )
      })}
    </ul>
  )
}

function DeliveryOptions() {
  return (
    <ul className="store__options">
      {deliveryOptions.map((option) => (
        <li key={option.id}>
          <span>{option.label}</span>
          <span>{formatPrice(option.cost)}</span>
        </li>
      ))}
    </ul>
  )
}

function PaymentOptions() {
  return (
    <ul className="store__options">
      {paymentOptions.map((option) => (
        <li key={option.id}>
          <span>{option.label}</span>
        </li>
      ))}
    </ul>
  )
}

function ContactValue({ contact }: { contact: StoreContact }) {
  if (contact.id === 'phone') {
    return <a href={`tel:${contact.value.replace(/[^\d+]/g, '')}`}>{contact.value}</a>
  }

  if (contact.id === 'email') {
    return <a href={`mailto:${contact.value}`}>{contact.value}</a>
  }

  return contact.value
}
