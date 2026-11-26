import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useFavorites } from '../../app/favorites-context.ts'
import { ProductCard } from '../../components/ProductCard/index.ts'
import { getProducts } from '../../data/catalog.ts'
import { productCategories } from '../../types/product.ts'
import {
  catalogOptions,
  filterCatalog,
  resolvePriceBounds,
  retainSelection,
  sortProducts,
  toggleSelection,
  withFavorites,
  type CategoryFilter,
  type SortOption,
} from '../../utils/catalog.ts'
import { formatPrice } from '../../utils/format.ts'
import { pageCopy, searchPageMeta } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { readCatalogQuery, replaceList } from './catalog-params.ts'
import { CatalogFilters } from './CatalogFilters.tsx'
import './Catalog.css'

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'По подбору' },
  { id: 'newest', label: 'Сначала новинки' },
  { id: 'price-asc', label: 'Сначала дешевле' },
  { id: 'price-desc', label: 'Сначала дороже' },
]

function isSortOption(value: string): value is SortOption {
  return SORT_OPTIONS.some((option) => option.id === value)
}

export function Catalog() {
  const filtersId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mobileFilters, setMobileFilters] = useState(
    () => window.matchMedia('(max-width: 63.99rem)').matches,
  )
  const query = readCatalogQuery(searchParams)
  const search = query.search.trim()
  usePageMeta(search ? searchPageMeta(search) : pageCopy.catalog)
  const { favoriteIds, toggleFavorite } = useFavorites()
  const catalog = getProducts()
  const options = useMemo(() => catalogOptions(catalog, query.category), [catalog, query.category])
  const price = resolvePriceBounds(query.minPrice, query.maxPrice)
  const visibleProducts = useMemo(
    () =>
      withFavorites(
        sortProducts(
          filterCatalog(catalog, {
            search: query.search,
            category: query.category,
            subcategory: query.subcategory,
            materials: query.materials,
            colors: query.colors,
            minPrice: price.min,
            maxPrice: price.max,
            onlyNew: query.onlyNew,
            onlyBestseller: query.onlyBestseller,
          }),
          query.sort,
        ),
        favoriteIds,
      ),
    [catalog, favoriteIds, price.max, price.min, query],
  )
  const activeFilters = [
    query.search.trim()
      ? { id: 'search', label: query.search.trim(), onRemove: () => setSearch('') }
      : null,
    query.category !== 'all'
      ? {
          id: 'category',
          label: productCategories[query.category],
          onRemove: () => selectCategory('all'),
        }
      : null,
    query.subcategory
      ? { id: 'subcategory', label: query.subcategory, onRemove: () => setSubcategory('') }
      : null,
    ...query.materials.map((material) => ({
      id: `material-${material}`,
      label: material,
      onRemove: () => toggleMaterial(material),
    })),
    ...query.colors.map((color) => ({
      id: `color-${color}`,
      label: color,
      onRemove: () => toggleColor(color),
    })),
    query.minPrice.trim() || query.maxPrice.trim()
      ? {
          id: 'price',
          label: priceChip(query.minPrice, query.maxPrice, price.min, price.max),
          onRemove: () => {
            setMinPrice('')
            setMaxPrice('')
          },
        }
      : null,
    query.onlyNew ? { id: 'new', label: 'Новинки', onRemove: () => setFlag('new', false) } : null,
    query.onlyBestseller
      ? { id: 'bestseller', label: 'Бестселлеры', onRemove: () => setFlag('bestseller', false) }
      : null,
  ].flatMap((filter) => (filter ? [filter] : []))
  const panelHidden = mobileFilters && !filtersOpen

  useEffect(() => {
    const media = window.matchMedia('(max-width: 63.99rem)')
    const onChange = () => {
      setMobileFilters(media.matches)

      if (!media.matches) {
        setFiltersOpen(false)
      }
    }

    media.addEventListener('change', onChange)

    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!filtersOpen || !mobileFilters) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false)
      }
    }

    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen, mobileFilters])

  const updateQuery = (change: (params: URLSearchParams) => void) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        change(next)
        return next
      },
      { replace: true },
    )
  }

  const setSearch = (value: string) => {
    updateQuery((params) => {
      if (value.trim()) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
    })
  }

  const selectCategory = (next: CategoryFilter) => {
    updateQuery((params) => {
      if (next === 'all') {
        params.delete('category')
      } else {
        params.set('category', next)
      }

      const nextOptions = catalogOptions(catalog, next)
      const subcategory = params.get('subcategory') ?? ''

      if (!nextOptions.subcategories.includes(subcategory)) {
        params.delete('subcategory')
      }

      replaceList(params, 'material', retainSelection(params.getAll('material'), nextOptions.materials))
      replaceList(params, 'color', retainSelection(params.getAll('color'), nextOptions.colors))
    })
  }

  const setSubcategory = (value: string) => {
    updateQuery((params) => {
      if (value) {
        params.set('subcategory', value)
      } else {
        params.delete('subcategory')
      }
    })
  }

  const toggleMaterial = (value: string) => {
    updateQuery((params) => {
      replaceList(params, 'material', toggleSelection(query.materials, value))
    })
  }

  const toggleColor = (value: string) => {
    updateQuery((params) => {
      replaceList(params, 'color', toggleSelection(query.colors, value))
    })
  }

  const setMinPrice = (value: string) => {
    updateQuery((params) => {
      if (value.trim()) {
        params.set('min', value)
      } else {
        params.delete('min')
      }
    })
  }

  const setMaxPrice = (value: string) => {
    updateQuery((params) => {
      if (value.trim()) {
        params.set('max', value)
      } else {
        params.delete('max')
      }
    })
  }

  const setFlag = (key: 'new' | 'bestseller', enabled: boolean) => {
    updateQuery((params) => {
      if (enabled) {
        params.set(key, '1')
      } else {
        params.delete(key)
      }
    })
  }

  const setSort = (value: SortOption) => {
    updateQuery((params) => {
      if (value === 'featured') {
        params.delete('sort')
      } else {
        params.set('sort', value)
      }
    })
  }

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return (
    <section className="catalog section" aria-labelledby="catalog-title">
      <div className="container catalog__inner">
        <header className="catalog__header">
          <p className="catalog__kicker">Коллекция</p>
          <h1 id="catalog-title">Каталог</h1>
          <p className="catalog__lead">
            Мебель и предметы для дома. Раздел, материал, цвет и цена сужают коллекцию, не пряча
            название и стоимость.
          </p>
        </header>

        <form className="catalog__search" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="catalog__search-field" htmlFor="catalog-search">
            <span className="catalog__sort-label">Поиск</span>
            <input
              id="catalog-search"
              type="search"
              value={query.search}
              placeholder="Название, материал, цвет"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {query.search ? (
            <button className="catalog__search-clear" type="button" onClick={() => setSearch('')}>
              Очистить
            </button>
          ) : null}
        </form>

        <div className={filtersOpen ? 'catalog__workspace is-open' : 'catalog__workspace'}>
          <button
            className="catalog__backdrop"
            type="button"
            aria-label="Закрыть фильтры"
            tabIndex={panelHidden ? -1 : undefined}
            onClick={() => setFiltersOpen(false)}
          />
          <aside
            id={filtersId}
            className="catalog__panel"
            aria-label="Фильтры каталога"
            aria-hidden={panelHidden || undefined}
            inert={panelHidden ? true : undefined}
          >
            <CatalogFilters
              query={query}
              options={options}
              priceError={price.error}
              closeRef={closeRef}
              onClose={() => setFiltersOpen(false)}
              onCategory={selectCategory}
              onSubcategory={setSubcategory}
              onToggleMaterial={toggleMaterial}
              onToggleColor={toggleColor}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onOnlyNew={() => setFlag('new', !query.onlyNew)}
              onOnlyBestseller={() => setFlag('bestseller', !query.onlyBestseller)}
              onReset={resetFilters}
            />
          </aside>

          <div className="catalog__results">
            <div className="catalog__toolbar">
              {activeFilters.length > 0 ? (
                <p className="catalog__count">Фильтры: {activeFilters.length}</p>
              ) : null}
              <button
                className="catalog__filters-open"
                type="button"
                aria-expanded={filtersOpen}
                aria-controls={filtersId}
                onClick={() => setFiltersOpen(true)}
              >
                Фильтры{activeFilters.length > 0 ? ` · ${activeFilters.length}` : ''}
              </button>
              <label className="catalog__sort">
                <span className="catalog__sort-label">Сортировка</span>
                <select
                  value={query.sort}
                  onChange={(event) => {
                    if (isSortOption(event.target.value)) {
                      setSort(event.target.value)
                    }
                  }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {activeFilters.length > 0 ? (
              <div className="catalog__active">
                <ul className="catalog__chips">
                  {activeFilters.map((filter) => (
                    <li key={filter.id}>
                      <button
                        className="catalog__chip"
                        type="button"
                        aria-label={`Убрать фильтр ${filter.label}`}
                        onClick={filter.onRemove}
                      >
                        <span aria-hidden="true">{filter.label}</span>
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="catalog__reset" type="button" onClick={resetFilters}>
                  Сбросить всё
                </button>
              </div>
            ) : null}

            {visibleProducts.length > 0 ? (
              <ul className="catalog__grid">
                {visibleProducts.map((product, index) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      onToggleFavorite={toggleFavorite}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="catalog__empty">
                <h2>Ничего не найдено</h2>
                <p>По этим условиям в коллекции ничего нет.</p>
                {activeFilters.length > 0 ? (
                  <button className="catalog__empty-reset" type="button" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function priceChip(
  minRaw: string,
  maxRaw: string,
  min: number | null,
  max: number | null,
): string {
  if (min !== null || max !== null) {
    if (min !== null && max !== null) {
      return `${formatPrice(min)} – ${formatPrice(max)}`
    }

    if (min !== null) {
      return `от ${formatPrice(min)}`
    }

    return `до ${formatPrice(max ?? 0)}`
  }

  const left = minRaw.trim()
  const right = maxRaw.trim()

  if (left && right) {
    return `${left} – ${right}`
  }

  if (left) {
    return `от ${left}`
  }

  return `до ${right}`
}
