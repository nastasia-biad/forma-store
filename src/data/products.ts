import dresserImage from '../assets/products/komod-tishina.webp'
import dresserPreview from '../assets/products/komod-tishina-960.webp'
import dresserDetailImage from '../assets/products/komod-tishina-detail.webp'
import dresserDetailPreview from '../assets/products/komod-tishina-detail-960.webp'
import lampImage from '../assets/products/lampa-duga.webp'
import lampPreview from '../assets/products/lampa-duga-960.webp'
import lampDetailImage from '../assets/products/lampa-duga-detail.webp'
import lampDetailPreview from '../assets/products/lampa-duga-detail-960.webp'
import throwImage from '../assets/products/pled-pole.webp'
import throwPreview from '../assets/products/pled-pole-960.webp'
import throwDetailImage from '../assets/products/pled-pole-detail.webp'
import throwDetailPreview from '../assets/products/pled-pole-detail-960.webp'
import shelfImage from '../assets/products/stellazh-ritm.webp'
import shelfPreview from '../assets/products/stellazh-ritm-960.webp'
import shelfDetailImage from '../assets/products/stellazh-ritm-detail.webp'
import shelfDetailPreview from '../assets/products/stellazh-ritm-detail-960.webp'
import tableImage from '../assets/products/stol-ploskost.webp'
import tablePreview from '../assets/products/stol-ploskost-960.webp'
import tableDetailImage from '../assets/products/stol-ploskost-detail.webp'
import tableDetailPreview from '../assets/products/stol-ploskost-detail-960.webp'
import chairImage from '../assets/products/stul-liniya.webp'
import chairPreview from '../assets/products/stul-liniya-960.webp'
import chairDetailImage from '../assets/products/stul-liniya-detail.webp'
import chairDetailPreview from '../assets/products/stul-liniya-detail-960.webp'
import vaseImage from '../assets/products/vaza-obyom.webp'
import vasePreview from '../assets/products/vaza-obyom-960.webp'
import vaseDetailImage from '../assets/products/vaza-obyom-detail.webp'
import vaseDetailPreview from '../assets/products/vaza-obyom-detail-960.webp'
import mirrorImage from '../assets/products/zerkalo-rama.webp'
import mirrorPreview from '../assets/products/zerkalo-rama-960.webp'
import mirrorDetailImage from '../assets/products/zerkalo-rama-detail.webp'
import mirrorDetailPreview from '../assets/products/zerkalo-rama-detail-960.webp'
import type { Product, ProductImage } from '../types/product.ts'

function photo(src: string, preview: string): ProductImage {
  return { src, preview, width: 1152, height: 864 }
}

/** Stand-in for a future API response. The shape matches Product. */
export const products: Product[] = [
  {
    id: 'stul-liniya',
    name: 'Стул «Линия»',
    slug: 'stul-liniya',
    price: 24900,
    category: 'furniture',
    subcategory: 'Стулья',
    description:
      'Лёгкий дубовый каркас и тканевое сиденье без рисунка и лишнего декора. Габариты 48 × 52 × 78 см: стул остаётся тонким в комнате и читается как отдельный предмет, а не часть глухого комплекта. Цвет каркаса — натуральный дуб.',
    images: [photo(chairImage, chairPreview), photo(chairDetailImage, chairDetailPreview)],
    material: 'Дуб, ткань',
    color: 'Натуральный дуб',
    dimensions: '48 × 52 × 78 см',
    isFavorite: false,
    isNew: true,
    isBestseller: false,
  },
  {
    id: 'stol-ploskost',
    name: 'Журнальный стол «Плоскость»',
    slug: 'stol-ploskost',
    price: 36500,
    category: 'furniture',
    subcategory: 'Столы',
    description:
      'Низкий журнальный стол из светлого дуба с тонкой кромкой. Столешница 110 × 60 см и высота 38 см оставляют воздух вокруг ножек, поэтому стол держит центр гостиной, не перекрывая вид на остальную мебель.',
    images: [photo(tableImage, tablePreview), photo(tableDetailImage, tableDetailPreview)],
    material: 'Дуб',
    color: 'Светлый дуб',
    dimensions: '110 × 60 × 38 см',
    isFavorite: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: 'stellazh-ritm',
    name: 'Стеллаж «Ритм»',
    slug: 'stellazh-ritm',
    price: 42900,
    category: 'furniture',
    subcategory: 'Хранение',
    description:
      'Открытый стеллаж из натурального дуба. Полки разной высоты рассчитаны на книги и несколько предметов, а не на глухие фасады. Ширина 90 см, глубина 32 см и высота 160 см: стеллаж уже комода и занимает стену по вертикали.',
    images: [photo(shelfImage, shelfPreview), photo(shelfDetailImage, shelfDetailPreview)],
    material: 'Дуб',
    color: 'Натуральный дуб',
    dimensions: '90 × 32 × 160 см',
    isFavorite: false,
    isNew: true,
    isBestseller: false,
  },
  {
    id: 'komod-tishina',
    name: 'Комод «Тишина»',
    slug: 'komod-tishina',
    price: 54800,
    category: 'furniture',
    subcategory: 'Хранение',
    description:
      'Комод из тёплого дуба с четырьмя широкими ящиками без заметной фурнитуры. Фасад остаётся спокойным. Габариты 140 × 45 × 78 см: хранение закрытое, в отличие от открытых полок стеллажа.',
    images: [photo(dresserImage, dresserPreview), photo(dresserDetailImage, dresserDetailPreview)],
    material: 'Дуб',
    color: 'Тёплый дуб',
    dimensions: '140 × 45 × 78 см',
    isFavorite: false,
    isNew: false,
    isBestseller: true,
  },
  {
    id: 'vaza-obyom',
    name: 'Ваза «Объём»',
    slug: 'vaza-obyom',
    price: 4900,
    category: 'accessories',
    subcategory: 'Керамика',
    description:
      'Ваза из матовой песочной керамики с мягкой неровностью поверхности. Диаметр 18 см и высота 28 см позволяют поставить её одну на стол: объём держит поверхность без букета и без дополнительного декора.',
    images: [photo(vaseImage, vasePreview), photo(vaseDetailImage, vaseDetailPreview)],
    material: 'Керамика',
    color: 'Песочный',
    dimensions: 'Ø 18 × 28 см',
    isFavorite: false,
    isNew: true,
    isBestseller: false,
  },
  {
    id: 'pled-pole',
    name: 'Плед «Поле»',
    slug: 'pled-pole',
    price: 8900,
    category: 'accessories',
    subcategory: 'Текстиль',
    description:
      'Плед из плотной оливковой шерсти. Размер 140 × 200 см рассчитан на диван: свободно накинутый, он даёт цвет комнате, сложенный стопкой — остаётся одним пятном. Тон глубже светлого дерева и спокойнее яркой обивки.',
    images: [photo(throwImage, throwPreview), photo(throwDetailImage, throwDetailPreview)],
    material: 'Шерсть',
    color: 'Оливковый',
    dimensions: '140 × 200 см',
    isFavorite: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: 'lampa-duga',
    name: 'Лампа «Дуга»',
    slug: 'lampa-duga',
    price: 12900,
    category: 'accessories',
    subcategory: 'Свет',
    description:
      'Настольная лампа с тонкой латунной ножкой и льняным абажуром. Габариты 28 × 28 × 46 см. Лён приглушает свет, поэтому лампа остаётся тёплой линией рядом с мебелью, а не отдельным ярким акцентом.',
    images: [photo(lampImage, lampPreview), photo(lampDetailImage, lampDetailPreview)],
    material: 'Латунь, лён',
    color: 'Латунь',
    dimensions: '28 × 28 × 46 см',
    isFavorite: false,
    isNew: true,
    isBestseller: false,
  },
  {
    id: 'zerkalo-rama',
    name: 'Зеркало «Рама»',
    slug: 'zerkalo-rama',
    price: 16400,
    category: 'accessories',
    subcategory: 'Зеркала',
    description:
      'Зеркало в тонкой раме из натурального дуба. Высота 90 см, ширина 60 см и глубина рамы 4 см. Его можно опереть или повесить: рама не спорит со стеной и не добавляет отдельный декоративный рисунок.',
    images: [photo(mirrorImage, mirrorPreview), photo(mirrorDetailImage, mirrorDetailPreview)],
    material: 'Дуб, зеркало',
    color: 'Натуральный дуб',
    dimensions: '60 × 4 × 90 см',
    isFavorite: false,
    isNew: false,
    isBestseller: true,
  },
]
