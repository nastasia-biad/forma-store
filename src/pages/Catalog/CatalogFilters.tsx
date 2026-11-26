import { useState, type RefObject } from 'react'
import { colorSwatch } from '../../content/colors.ts'
import { productCategories } from '../../types/product.ts'
import type { CatalogOptions, CategoryFilter } from '../../utils/catalog.ts'
import type { CatalogQuery } from './catalog-params.ts'

const collapsedMaterialCount = 5

type CatalogFiltersProps = {
  query: CatalogQuery
  options: CatalogOptions
  priceError: string | null
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onCategory: (category: CategoryFilter) => void
  onSubcategory: (value: string) => void
  onToggleMaterial: (value: string) => void
  onToggleColor: (value: string) => void
  onMinPrice: (value: string) => void
  onMaxPrice: (value: string) => void
  onOnlyNew: () => void
  onOnlyBestseller: () => void
  onReset: () => void
}

export function CatalogFilters({
  query,
  options,
  priceError,
  closeRef,
  onClose,
  onCategory,
  onSubcategory,
  onToggleMaterial,
  onToggleColor,
  onMinPrice,
  onMaxPrice,
  onOnlyNew,
  onOnlyBestseller,
  onReset,
}: CatalogFiltersProps) {
  return (
    <div className="filter-panel">
      <div className="filter-panel__head">
        <h2>Фильтры</h2>
        <button ref={closeRef} className="filter-panel__close" type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <div className="filter-panel__body">
      <fieldset className="filter-group">
        <legend>Раздел</legend>
        <div className="filter-list" role="group" aria-label="Раздел">
          <Choice
            pressed={query.category === 'all'}
            label="Всё"
            onClick={() => onCategory('all')}
          />
          <Choice
            pressed={query.category === 'furniture'}
            label={productCategories.furniture}
            onClick={() => onCategory('furniture')}
          />
          <Choice
            pressed={query.category === 'accessories'}
            label={productCategories.accessories}
            onClick={() => onCategory('accessories')}
          />
        </div>
      </fieldset>

      {options.subcategories.length > 0 ? (
        <fieldset className="filter-group">
          <legend>Подкатегория</legend>
          <div className="filter-list" role="group" aria-label="Подкатегория">
            <Choice
              pressed={query.subcategory === ''}
              label="Все"
              onClick={() => onSubcategory('')}
            />
            {options.subcategories.map((option) => (
              <Choice
                key={option}
                pressed={query.subcategory === option}
                label={option}
                onClick={() => onSubcategory(query.subcategory === option ? '' : option)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      <MaterialList
        options={options.materials}
        selected={query.materials}
        onToggle={onToggleMaterial}
      />

      {options.colors.length > 0 ? (
        <fieldset className="filter-group">
          <legend>Цвет</legend>
          <div className="filter-list">
            {options.colors.map((option) => {
              const swatch = colorSwatch(option)

              return (
                <label key={option} className="filter-check filter-color">
                  <input
                    type="checkbox"
                    checked={query.colors.includes(option)}
                    onChange={() => onToggleColor(option)}
                  />
                  <span
                    className={swatch ? 'filter-swatch' : 'filter-swatch filter-swatch--empty'}
                    style={swatch ? { backgroundColor: swatch } : undefined}
                    aria-hidden="true"
                  />
                  <span className="filter-check__name">{option}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="filter-group">
        <legend>Цена</legend>
        <div className="filter-price">
          <label>
            <span>От, ₽</span>
            <input
              inputMode="numeric"
              value={query.minPrice}
              aria-invalid={priceError ? true : undefined}
              onChange={(event) => onMinPrice(event.target.value)}
            />
          </label>
          <label>
            <span>До, ₽</span>
            <input
              inputMode="numeric"
              value={query.maxPrice}
              aria-invalid={priceError ? true : undefined}
              onChange={(event) => onMaxPrice(event.target.value)}
            />
          </label>
        </div>
        {priceError ? <p className="filter-price__error">{priceError}</p> : null}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Отметки</legend>
        <div className="filter-list">
          <label className="filter-check">
            <input type="checkbox" checked={query.onlyNew} onChange={onOnlyNew} />
            <span className="filter-check__name">Новинки</span>
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={query.onlyBestseller} onChange={onOnlyBestseller} />
            <span className="filter-check__name">Бестселлеры</span>
          </label>
        </div>
      </fieldset>
      </div>

      <div className="filter-panel__actions">
        <button className="filter-panel__apply" type="button" onClick={onClose}>
          Показать
        </button>
        <button className="filter-panel__reset" type="button" onClick={onReset}>
          Сбросить
        </button>
      </div>
    </div>
  )
}

function Choice({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button className="filter-choice" type="button" aria-pressed={pressed} onClick={onClick}>
      <span>{label}</span>
    </button>
  )
}

function MaterialList({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[]
  selected: readonly string[]
  onToggle: (value: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  if (options.length === 0) {
    return null
  }

  const visible = expanded
    ? options
    : options.filter((option, index) => index < collapsedMaterialCount || selected.includes(option))
  const canCollapse = options.length > collapsedMaterialCount

  return (
    <fieldset className="filter-group">
      <legend>Материал</legend>
      <div className="filter-list">
        {visible.map((option) => (
          <label key={option} className="filter-check">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span className="filter-check__name">{option}</span>
          </label>
        ))}
      </div>
      {canCollapse ? (
        <button className="filter-more" type="button" onClick={() => setExpanded((current) => !current)}>
          {expanded ? 'Свернуть' : 'Показать все материалы'}
        </button>
      ) : null}
    </fieldset>
  )
}
