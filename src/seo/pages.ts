import { siteName } from '../content/site.ts'
import type { JournalArticle } from '../content/journal.ts'
import type { Product } from '../types/product.ts'
import { formatPrice } from '../utils/format.ts'

export type PageMeta = {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
}

export const defaultOgImage = '/og.webp'

export const pageCopy = {
  home: {
    title: 'Мебель и предметы для дома',
    description:
      'Дуб, шерсть, керамика и тихий свет. FORMA собирает мебель и предметы, которые оставляют комнате воздух.',
    path: '/',
  },
  catalog: {
    title: 'Каталог мебели и предметов',
    description:
      'Стулья, столы, хранение, свет, зеркала и декор. В каталоге видны цена, материал и цвет каждой вещи.',
    path: '/catalog',
  },
  favorites: {
    title: 'Избранное',
    description: 'Список избранного хранится в этом браузере и не отправляется в магазин.',
    path: '/favorites',
    noindex: true,
  },
  cart: {
    title: 'Корзина',
    description:
      'Состав корзины и сумма на этом устройстве. Переход к оформлению не отправляет заказ.',
    path: '/cart',
    noindex: true,
  },
  checkout: {
    title: 'Оформление заказа',
    description:
      'Запись заказа остаётся в этом браузере. Магазин не получает уведомление, оплата не проводится.',
    path: '/checkout',
    noindex: true,
  },
  orders: {
    title: 'Заказы в этом браузере',
    description:
      'История записей этого браузера. Магазин их не получает и отметки сам не меняет.',
    path: '/orders',
    noindex: true,
  },
  about: {
    title: 'О магазине',
    description:
      'Мебель, свет и предметы, у которых форма держит пространство раньше декора. Шоурум в Москве.',
    path: '/about',
  },
  delivery: {
    title: 'Доставка',
    description:
      'Стоимость способа доставки видна до подтверждения и входит в итог. Срок и район на сайте не задаются.',
    path: '/delivery',
  },
  payment: {
    title: 'Оплата',
    description:
      'Оплата при получении или банковской картой. На сайте деньги не списываются и номер карты не запрашивается.',
    path: '/payment',
  },
  returns: {
    title: 'Возврат и обмен',
    description:
      'Права покупателя при дистанционном заказе и то, чего магазин пока не добавляет от себя.',
    path: '/returns',
  },
  contacts: {
    title: 'Контакты',
    description:
      'Интернет-магазин мебели и предметов интерьера. На странице указан город шоурума: Москва.',
    path: '/contacts',
  },
  faq: {
    title: 'Вопросы',
    description:
      'Короткие ответы о размере, материале, доставке и о том, как заказ сохраняется в браузере.',
    path: '/faq',
  },
  journal: {
    title: 'Журнал',
    description:
      'Заметки о дереве, свете, пропорции и предметах, которые остаются в комнате дольше сезона.',
    path: '/journal',
  },
  missingPage: {
    title: 'Страница не найдена',
    description: 'Такого адреса в магазине FORMA нет. Откройте каталог или вернитесь на главную.',
    path: '/',
    noindex: true,
  },
  missingProduct: {
    title: 'Товар не найден',
    description: 'Этой позиции нет в коллекции FORMA. Посмотрите другие вещи в каталоге.',
    path: '/catalog',
    noindex: true,
  },
  missingArticle: {
    title: 'Заметка не найдена',
    description: 'Такой записи в журнале FORMA нет. Остальные заметки собраны на странице журнала.',
    path: '/journal',
    noindex: true,
  },
  missingOrder: {
    title: 'Заказ не найден',
    description: 'В этом браузере нет заказа с таким номером.',
    path: '/orders',
    noindex: true,
  },
} as const satisfies Record<string, PageMeta>

export function fullTitle(title: string): string {
  const trimmed = title.trim()

  if (trimmed === siteName || trimmed.endsWith(`— ${siteName}`)) {
    return trimmed
  }

  return `${trimmed} — ${siteName}`
}

export function shorten(text: string, limit = 160): string {
  const flat = text.replace(/\s+/g, ' ').trim()

  if (flat.length <= limit) {
    return flat
  }

  const cut = flat.slice(0, limit - 1)
  const space = cut.lastIndexOf(' ')
  const end = space > 80 ? space : limit - 1

  return `${cut.slice(0, end).trimEnd()}…`
}

export function searchPageMeta(query: string): PageMeta {
  const trimmed = query.trim()

  return {
    title: `Поиск: ${trimmed}`,
    description: shorten(
      `Поиск «${trimmed}» в каталоге FORMA. Если ничего не найдено, условия можно сбросить и вернуться ко всей коллекции.`,
    ),
    path: '/catalog',
  }
}

export function productPageMeta(product: Product): PageMeta {
  const sentence = product.description.split(/(?<=\.)\s/)[0] ?? product.description

  return {
    title: product.name,
    description: shorten(`${product.name}, ${formatPrice(product.price)}. ${sentence}`),
    path: `/catalog/${product.slug}`,
    image: product.images[0]?.src,
  }
}

export function articlePageMeta(article: JournalArticle, image?: string): PageMeta {
  return {
    title: article.title,
    description: shorten(article.excerpt),
    path: `/journal/${article.slug}`,
    image,
  }
}

export function orderPageMeta(number: string): PageMeta {
  return {
    title: `Заказ ${number}`,
    description: shorten(
      `Запись заказа ${number} в этом браузере: состав, цены на момент записи и отметка. Магазин заказ не обрабатывает.`,
    ),
    path: `/orders/${encodeURIComponent(number)}`,
    noindex: true,
  }
}
