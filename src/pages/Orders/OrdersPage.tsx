import { Link } from 'react-router'
import { demoOrderStatusLabels, localOrders } from '../../orders/orders.ts'
import { deliveryLabel, paymentLabel } from '../../utils/checkout.ts'
import { formatPrice } from '../../utils/format.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatOrderDate } from './format.ts'
import './Orders.css'

export function OrdersPage() {
  usePageMeta(pageCopy.orders)
  const orders = localOrders.listOrders()

  return (
    <article className="orders section">
      <div className="container-narrow orders__inner">
        <nav className="orders__crumbs" aria-label="Навигация">
          <ol>
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li aria-current="page">Заказы</li>
          </ol>
        </nav>
        <p className="orders__kicker">На этом устройстве</p>
        <h1>Заказы</h1>
        <p className="orders__lead">
          Здесь только записи этого браузера. Магазин их не получает, оплату не проводит и отметки
          сам не меняет.
        </p>

        {orders.length === 0 ? (
          <div className="orders__empty">
            <h2>Заказов пока нет</h2>
            <p>После записи на странице оформления заказ появится в этом списке.</p>
            <Link className="orders__button" to="/catalog">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <ul className="orders__list">
            {orders.map((order) => (
              <li key={order.number}>
                <article className="orders__card">
                  <div className="orders__card-copy">
                    <p className="orders__number">{order.number}</p>
                    <p className="orders__meta">{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <p className="orders__status">{demoOrderStatusLabels[order.status]}</p>
                  <p className="orders__sum">{formatPrice(order.total)}</p>
                  <p className="orders__ways">
                    {deliveryLabel(order.delivery)} · {paymentLabel(order.payment)}
                  </p>
                  <Link className="orders__more" to={`/orders/${encodeURIComponent(order.number)}`}>
                    Открыть заказ
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
