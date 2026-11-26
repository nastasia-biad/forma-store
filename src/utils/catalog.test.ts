import { describe, expect, it } from 'vitest'
import { getProducts } from '../data/catalog.ts'
import type { Product, ProductImage } from '../types/product.ts'
import { filterCatalog, sortProducts, type CatalogFilters } from './catalog.ts'

const products = getProducts()

const openFilters: CatalogFilters = {
  search: '',
  category: 'all',
  subcategory: '',
  materials: [],
  colors: [],
  minPrice: null,
  maxPrice: null,
  onlyNew: false,
  onlyBestseller: false,
}

const sampleImage: ProductImage = {
  src: 'sample.webp',
  preview: 'sample-960.webp',
  width: 1152,
  height: 864,
}

function filters(overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  return { ...openFilters, ...overrides }
}

function ids(items: readonly Product[]): string[] {
  return items.map((product) => product.id)
}

function sampleProduct(overrides: Partial<Product> & Pick<Product, 'id' | 'price'>): Product {
  return {
    name: 'Образец',
    slug: overrides.id,
    category: 'furniture',
    subcategory: 'Стулья',
    description: 'Описание образца',
    images: [sampleImage],
    material: 'Дуб',
    color: 'Белый',
    dimensions: '1 × 1 × 1 см',
    isFavorite: false,
    isNew: false,
    isBestseller: false,
    ...overrides,
  }
}

describe('поиск', () => {
  it('находит товар по названию', () => {
    expect(ids(filterCatalog(products, filters({ search: 'Журнальный' })))).toEqual([
      'stol-ploskost',
    ])
  })

  it('находит товар по описанию', () => {
    expect(ids(filterCatalog(products, filters({ search: 'фурнитуры' })))).toEqual([
      'komod-tishina',
    ])
  })

  it('находит товар по материалу', () => {
    expect(ids(filterCatalog(products, filters({ search: 'Латунь, лён' })))).toEqual([
      'lampa-duga',
    ])
  })

  it('находит товар по цвету', () => {
    expect(ids(filterCatalog(products, filters({ search: 'Оливковый' })))).toEqual(['pled-pole'])
  })

  it('не учитывает регистр запроса', () => {
    expect(ids(filterCatalog(products, filters({ search: 'жУрНаЛьНыЙ' })))).toEqual([
      'stol-ploskost',
    ])
  })

  it('обрезает пробелы в начале и конце запроса', () => {
    expect(ids(filterCatalog(products, filters({ search: '  фурнитуры  ' })))).toEqual([
      'komod-tishina',
    ])
  })

  it('возвращает весь каталог при пустом запросе', () => {
    expect(ids(filterCatalog(products, filters({ search: '' })))).toEqual(ids(products))
  })
})

describe('категории', () => {
  it('оставляет только мебель', () => {
    expect(ids(filterCatalog(products, filters({ category: 'furniture' })))).toEqual([
      'stul-liniya',
      'stol-ploskost',
      'stellazh-ritm',
      'komod-tishina',
    ])
  })

  it('оставляет только аксессуары', () => {
    expect(ids(filterCatalog(products, filters({ category: 'accessories' })))).toEqual([
      'vaza-obyom',
      'pled-pole',
      'lampa-duga',
      'zerkalo-rama',
    ])
  })

  it('фильтрует по подкатегории', () => {
    expect(ids(filterCatalog(products, filters({ subcategory: 'Хранение' })))).toEqual([
      'stellazh-ritm',
      'komod-tishina',
    ])
  })
})

describe('характеристики', () => {
  it('фильтрует по одному материалу', () => {
    expect(ids(filterCatalog(products, filters({ materials: ['Дуб'] })))).toEqual([
      'stol-ploskost',
      'stellazh-ritm',
      'komod-tishina',
    ])
  })

  it('фильтрует по нескольким материалам', () => {
    expect(ids(filterCatalog(products, filters({ materials: ['Дуб', 'Шерсть'] })))).toEqual([
      'stol-ploskost',
      'stellazh-ritm',
      'komod-tishina',
      'pled-pole',
    ])
  })

  it('фильтрует по одному цвету', () => {
    expect(ids(filterCatalog(products, filters({ colors: ['Латунь'] })))).toEqual(['lampa-duga'])
  })

  it('фильтрует по нескольким цветам', () => {
    expect(ids(filterCatalog(products, filters({ colors: ['Песочный', 'Оливковый'] })))).toEqual([
      'vaza-obyom',
      'pled-pole',
    ])
  })
})

describe('цена', () => {
  it('оставляет товары не дешевле минимальной цены', () => {
    expect(ids(filterCatalog(products, filters({ minPrice: 40000 })))).toEqual([
      'stellazh-ritm',
      'komod-tishina',
    ])
  })

  it('оставляет товары не дороже максимальной цены', () => {
    expect(ids(filterCatalog(products, filters({ maxPrice: 10000 })))).toEqual([
      'vaza-obyom',
      'pled-pole',
    ])
  })

  it('оставляет товары внутри диапазона', () => {
    expect(
      ids(filterCatalog(products, filters({ minPrice: 12000, maxPrice: 20000 }))),
    ).toEqual(['lampa-duga', 'zerkalo-rama'])
  })

  it('включает товары на границах диапазона', () => {
    const priced = [
      sampleProduct({ id: 'low', price: 100 }),
      sampleProduct({ id: 'edge', price: 200 }),
      sampleProduct({ id: 'high', price: 300 }),
    ]

    expect(ids(filterCatalog(priced, filters({ minPrice: 200, maxPrice: 200 })))).toEqual([
      'edge',
    ])
  })
})

describe('дополнительные фильтры', () => {
  it('оставляет только новинки', () => {
    expect(ids(filterCatalog(products, filters({ onlyNew: true })))).toEqual([
      'stul-liniya',
      'stellazh-ritm',
      'vaza-obyom',
      'lampa-duga',
    ])
  })

  it('оставляет только бестселлеры', () => {
    expect(ids(filterCatalog(products, filters({ onlyBestseller: true })))).toEqual([
      'stol-ploskost',
      'komod-tishina',
      'pled-pole',
      'zerkalo-rama',
    ])
  })
})

describe('сочетание условий', () => {
  it('сужает поиск выбранной категорией', () => {
    expect(
      ids(filterCatalog(products, filters({ search: 'дуб', category: 'accessories' }))),
    ).toEqual(['zerkalo-rama'])
  })

  it('сочетает категорию, материал и цену', () => {
    expect(
      ids(
        filterCatalog(
          products,
          filters({ category: 'furniture', materials: ['Дуб'], minPrice: 40000 }),
        ),
      ),
    ).toEqual(['stellazh-ritm', 'komod-tishina'])
  })

  it('применяет несколько условий одновременно', () => {
    expect(
      ids(
        filterCatalog(
          products,
          filters({
            category: 'accessories',
            colors: ['Песочный'],
            maxPrice: 10000,
            onlyNew: true,
          }),
        ),
      ),
    ).toEqual(['vaza-obyom'])
  })
})

describe('сортировка', () => {
  it('ставит более дешёвые товары впереди', () => {
    expect(ids(sortProducts(products, 'price-asc'))).toEqual([
      'vaza-obyom',
      'pled-pole',
      'lampa-duga',
      'zerkalo-rama',
      'stul-liniya',
      'stol-ploskost',
      'stellazh-ritm',
      'komod-tishina',
    ])
  })

  it('ставит более дорогие товары впереди', () => {
    expect(ids(sortProducts(products, 'price-desc'))).toEqual([
      'komod-tishina',
      'stellazh-ritm',
      'stol-ploskost',
      'stul-liniya',
      'zerkalo-rama',
      'lampa-duga',
      'pled-pole',
      'vaza-obyom',
    ])
  })

  it('ставит новинки впереди и сохраняет их исходный порядок', () => {
    expect(ids(sortProducts(products, 'newest'))).toEqual([
      'stul-liniya',
      'stellazh-ritm',
      'vaza-obyom',
      'lampa-duga',
      'stol-ploskost',
      'komod-tishina',
      'pled-pole',
      'zerkalo-rama',
    ])
  })

  it('сохраняет порядок рекомендаций', () => {
    const ranked = sortProducts(products, 'featured')

    expect(ids(ranked)).toEqual(ids(products))
    expect(ranked).not.toBe(products)
  })
})

describe('дополнительные сценарии', () => {
  it('возвращает пустой список, если ничего не подошло', () => {
    expect(filterCatalog(products, filters({ search: 'кварц' }))).toEqual([])
  })

  it('не изменяет исходный массив товаров', () => {
    const orderBefore = ids(products)
    const pricesBefore = products.map((product) => product.price)

    const found = filterCatalog(products, filters({ search: 'Линия', category: 'furniture' }))

    sortProducts(products, 'price-desc')

    expect(found).not.toBe(products)
    expect(ids(products)).toEqual(orderBefore)
    expect(products.map((product) => product.price)).toEqual(pricesBefore)
  })

  it('не мутирует массив при сортировке', () => {
    const source = [
      sampleProduct({ id: 'high', price: 300 }),
      sampleProduct({ id: 'low', price: 100 }),
    ]

    const sorted = sortProducts(source, 'price-asc')

    expect(ids(source)).toEqual(['high', 'low'])
    expect(ids(sorted)).toEqual(['low', 'high'])
    expect(sorted).not.toBe(source)
  })
})
