import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useCart } from '../../app/cart-context.ts'
import { useFavorites } from '../../app/favorites-context.ts'
import { formatItemCount } from '../../utils/format.ts'
import './Header.css'

export function Header() {
  const { itemCount } = useCart()
  const { favoriteIds } = useFavorites()
  const favoriteCount = favoriteIds.size
  const location = useLocation()
  const navigate = useNavigate()
  const searchInputId = useId()
  const searchFormId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const currentQuery = new URLSearchParams(location.search).get('search')?.trim() ?? ''
  const catalogTo = currentQuery
    ? { pathname: '/catalog', search: `?${new URLSearchParams({ search: currentQuery }).toString()}` }
    : '/catalog'

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
  }, [searchOpen])

  const openSearch = () => {
    setDraft(currentQuery)
    setSearchOpen(true)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    searchButtonRef.current?.focus()
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    const next = new URLSearchParams(location.pathname === '/catalog' ? location.search : '')

    if (trimmed) {
      next.set('search', trimmed)
    } else {
      next.delete('search')
    }

    const query = next.toString()
    navigate(
      { pathname: '/catalog', search: query ? `?${query}` : '' },
      { replace: location.pathname === '/catalog' },
    )
    setSearchOpen(false)
    searchButtonRef.current?.focus()
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="header__logo" to="/">
          FORMA
        </Link>

        <nav className="header__nav" aria-label="Основная навигация">
          <ul className="header__menu">
            <li>
              <NavLink className="header__item" to={catalogTo}>
                Каталог
              </NavLink>
            </li>
            <li>
              <NavLink className="header__item" to="/journal">
                Журнал
              </NavLink>
            </li>
            <li>
              <NavLink className="header__item" to="/about">
                О нас
              </NavLink>
            </li>
            <li>
              <NavLink className="header__item" to="/contacts">
                Контакты
              </NavLink>
            </li>
          </ul>
        </nav>

        {searchOpen ? (
          <form id={searchFormId} className="header__search" role="search" onSubmit={submitSearch}>
            <label className="header__search-label" htmlFor={searchInputId}>
              Поиск по каталогу
            </label>
            <input
              ref={searchInputRef}
              id={searchInputId}
              type="search"
              name="search"
              value={draft}
              placeholder="Название, материал, цвет"
              autoComplete="off"
              enterKeyHint="search"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeSearch()
                }
              }}
            />
          </form>
        ) : null}

        <div className="header__actions">
          <button
            ref={searchButtonRef}
            className="header__action"
            type={searchOpen ? 'submit' : 'button'}
            form={searchOpen ? searchFormId : undefined}
            aria-expanded={searchOpen}
            aria-controls={searchOpen ? searchInputId : undefined}
            aria-label={searchOpen ? 'Искать в каталоге' : 'Открыть поиск'}
            onClick={searchOpen ? undefined : openSearch}
          >
            <SearchIcon />
          </button>
          <NavLink
            className="header__action"
            to="/favorites"
            aria-label={
              favoriteCount > 0 ? `Избранное, ${formatItemCount(favoriteCount)}` : 'Избранное'
            }
          >
            <HeartIcon />
            {favoriteCount > 0 ? <span className="header__count">{favoriteCount}</span> : null}
          </NavLink>
          <NavLink
            className="header__action"
            to="/cart"
            aria-label={itemCount > 0 ? `Корзина, ${formatItemCount(itemCount)}` : 'Корзина'}
          >
            <BagIcon />
            {itemCount > 0 ? <span className="header__count">{itemCount}</span> : null}
          </NavLink>
        </div>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" />
      <path d="M16.2 16.2 20 20" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19.4c-.4-.3-6.4-4-6.4-8.2A3.3 3.3 0 0 1 12 8.4a3.3 3.3 0 0 1 6.4 2.8c0 4.2-6 7.9-6.4 8.2Z" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg className="header__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.8 8.5h10.4l-.7 10.2H7.5L6.8 8.5Z" />
      <path d="M9 8.5V7.2a3 3 0 0 1 6 0v1.3" />
    </svg>
  )
}
