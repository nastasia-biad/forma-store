import { Link } from 'react-router'
import { publishedContacts, type StoreContact } from '../../content/store.ts'
import './Footer.css'

const shopLinks = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/journal', label: 'Журнал' },
  { href: '/favorites', label: 'Избранное' },
  { href: '/cart', label: 'Корзина' },
  { href: '/orders', label: 'Заказы' },
]

const buyerLinks = [
  { href: '/about', label: 'О компании' },
  { href: '/delivery', label: 'Доставка' },
  { href: '/payment', label: 'Оплата' },
  { href: '/returns', label: 'Возврат и обмен' },
  { href: '/faq', label: 'Вопросы' },
]

export function Footer() {
  const year = new Date().getFullYear()
  const contacts = publishedContacts()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link className="footer__logo" to="/">
            FORMA
          </Link>
          <p>Мебель и предметы для дома. Ясная форма, читаемый материал, точный размер.</p>
        </div>

        <nav aria-label="Магазин">
          <h2>Магазин</h2>
          <FooterLinks links={shopLinks} />
        </nav>

        <nav aria-label="Покупателям">
          <h2>Покупателям</h2>
          <FooterLinks links={buyerLinks} />
        </nav>

        <div>
          <h2>Контакты</h2>
          <ul>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <ContactLink contact={contact} />
              </li>
            ))}
            <li>
              <Link to="/contacts">Страница контактов</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer__bar">
        <p>© {year} FORMA</p>
      </div>
    </footer>
  )
}

function FooterLinks({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <Link to={link.href}>{link.label}</Link>
        </li>
      ))}
    </ul>
  )
}

function ContactLink({ contact }: { contact: StoreContact }) {
  if (contact.id === 'phone') {
    return <a href={`tel:${contact.value.replace(/[^\d+]/g, '')}`}>{contact.value}</a>
  }

  if (contact.id === 'email') {
    return <a href={`mailto:${contact.value}`}>{contact.value}</a>
  }

  return (
    <>
      {contact.label}: {contact.value}
    </>
  )
}
