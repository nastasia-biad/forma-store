import { Link, useParams } from 'react-router'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import { getProducts } from '../../data/catalog.ts'
import { demoOrderStatusLabels, localOrders, type StoredOrder } from '../../orders/orders.ts'
import { deliveryCost, deliveryLabel, paymentLabel } from '../../utils/checkout.ts'
import { formatItemCount, formatPrice } from '../../utils/format.ts'
import { orderPageMeta, pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatOrderDate } from './format.ts'
import './Orders.css'

export function OrderPage() {
  const { orderNumber } = useParams()
  const number = orderNumber ? decodeOrderNumber(orderNumber) : ''
  const order = number ? localOrders.findOrder(number) : null
  usePageMeta(
    order
      ? orderPageMeta(order.number)
      : { ...pageCopy.missingOrder, path: number ? `/orders/${encodeURIComponent(number)}` : '/orders' },
  )

  if (!order) {
    return (
      <article className="orders section">
        <div className="container-narrow orders__inner">
          <nav className="orders__crumbs" aria-label="Навигация">
            <ol>
              <li>
                <Link to="/">Главная</Link>
              </li>
              <li>
                <Link to="/orders">Заказы</Link>
              </li>
              <li aria-current="page">Не найден</li>
            </ol>
          </nav>
          <p className="orders__kicker">На этом устройстве</p>
          <h1>Заказ не найден</h1>
          <p className="orders__lead">
            В этом браузере нет записи с номером {number || 'без номера'}. Заказ мог быть записан в
            другом браузере или номер указан с ошибкой.
          </p>
          <div className="orders__actions">
            <Link className="orders__button" to="/orders">
              К списку заказов
            </Link>
            <Link className="orders__text-link" to="/catalog">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return <OrderDetails order={order} />
}

function OrderDetails({ order }: { order: StoredOrder }) {
  const catalog = getProducts()
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <article className="orders section">
      <div className="container-narrow orders__inner">
        <nav className="orders__crumbs" aria-label="Навигация">
          <ol>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li>
              <Link to="/orders">Заказы</Link>
            </li>
            <li aria-current="page">{order.number}</li>
          </ol>
        </nav>
        <p className="orders__kicker">Запись в браузере</p>
        <h1>{order.number}</h1>
        <p className="orders__lead">
          Состав и цены сохранены на момент записи. Магазин заказ не получил и не обрабатывает.
          Отметка «{demoOrderStatusLabels[order.status]}» не меняется со временем.
        </p>
        <dl className="orders__facts">
          <div>
            <dt>Дата</dt>
            <dd>{formatOrderDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt>Отметка</dt>
            <dd>{demoOrderStatusLabels[order.status]}</dd>
          </div>
          <div>
            <dt>Доставка</dt>
            <dd>
              {deliveryLabel(order.delivery)}, {formatPrice(deliveryCost(order.delivery))}
            </dd>
          </div>
          <div>
            <dt>Оплата</dt>
            <dd>{paymentLabel(order.payment)}</dd>
          </div>
          <div>
            <dt>Сумма</dt>
            <dd>
              {formatItemCount(itemCount)}, {formatPrice(order.total)}
            </dd>
          </div>
        </dl>
        <ul className="orders__lines">
          {order.lines.map((line, index) => {
            const product = catalog.find((item) => item.id === line.productId)
            const image = product?.images[0]

            return (
              <li key={`${line.productId}-${index}`}>
                <article className="orders__line">
                  <div className="orders__thumb">
                    {image ? (
                      <ProductPhoto
                        image={image}
                        alt=""
                        presentation="thumb"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    ) : null}
                  </div>
                  <div className="orders__line-copy">
                    {product ? (
                      <Link to={`/catalog/${product.slug}`}>{product.name}</Link>
                    ) : (
                      <p>Позиция заказа</p>
                    )}
                    <p>
                      {line.quantity} шт. · {formatPrice(line.unitPrice)}
                    </p>
                  </div>
                  <p className="orders__line-price">{formatPrice(line.unitPrice * line.quantity)}</p>
                </article>
              </li>
            )
          })}
        </ul>
        <Link className="orders__text-link" to="/orders">
          Все заказы
        </Link>
      </div>
    </article>
  )
}

function decodeOrderNumber(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
