import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../app/cart-context.ts'
import { ProductPhoto } from '../../components/ProductPhoto/ProductPhoto.tsx'
import { getProducts } from '../../data/catalog.ts'
import {
  createOrderNumber,
  demoOrderStatusLabels,
  localOrders,
  shouldClearCartAfter,
  type StoredOrder,
} from '../../orders/orders.ts'
import { resolveCartLines, summarizeCart } from '../../utils/cart.ts'
import {
  deliveryCost,
  deliveryLabel,
  deliveryOptions,
  emptyCheckoutForm,
  paymentLabel,
  paymentOptions,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutForm,
} from '../../utils/checkout.ts'
import { pageCopy } from '../../seo/pages.ts'
import { usePageMeta } from '../../seo/usePageMeta.ts'
import { formatItemCount, formatPrice } from '../../utils/format.ts'
import './Checkout.css'

export function Checkout() {
  usePageMeta(pageCopy.checkout)
  const formId = useId()
  const { lines, clearCart } = useCart()
  const formRef = useRef<HTMLFormElement>(null)
  const shouldFocusError = useRef(false)
  const [form, setForm] = useState<CheckoutForm>(emptyCheckoutForm)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<StoredOrder | null>(null)
  const [placing, setPlacing] = useState(false)
  const orderNumber = useRef<string | null>(null)
  const catalog = getProducts()
  const resolvedLines = useMemo(() => resolveCartLines(catalog, lines), [catalog, lines])
  const summary = useMemo(() => summarizeCart(resolvedLines), [resolvedLines])
  const shipping = deliveryCost(form.delivery)
  const total = summary.goodsTotal + shipping

  useEffect(() => {
    if (!shouldFocusError.current) {
      return
    }

    shouldFocusError.current = false
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [errors])

  if (confirmedOrder) {
    return <CheckoutSuccess order={confirmedOrder} />
  }

  if (resolvedLines.length === 0) {
    return <CheckoutEmpty />
  }

  const update =
    (field: keyof CheckoutForm) =>
    (value: string) => {
      setForm((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        if (!(field in current)) {
          return current
        }

        const next = { ...current }
        delete next[field as keyof CheckoutErrors]
        return next
      })
    }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (placing) {
      return
    }

    const nextErrors = validateCheckout(form)

    if (Object.keys(nextErrors).length > 0) {
      shouldFocusError.current = true
      setErrors(nextErrors)
      return
    }

    orderNumber.current ??= createOrderNumber()
    setPlacing(true)

    const placed = localOrders.placeOrder(
      form,
      resolvedLines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      orderNumber.current,
    )

    if (!shouldClearCartAfter(placed)) {
      setPlacing(false)

      if (!placed.ok && placed.reason === 'unavailable') {
        setSaveError('Не удалось сохранить подтверждение заказа. Корзина не изменена.')
      }

      return
    }

    if (!clearCart()) {
      setPlacing(false)
      setSaveError(
        `Подтверждение заказа ${placed.order.number} сохранено, но очистить корзину не удалось. Товары остались в корзине. Повторно отправлять форму не нужно.`,
      )
      return
    }

    setSaveError(null)
    setConfirmedOrder(placed.order)
  }

  return (
    <section className="checkout section" aria-labelledby="checkout-title">
      <div className="container checkout__inner">
        <header className="checkout__header">
          <p className="checkout__kicker">FORMA</p>
          <h1 id="checkout-title" className="checkout__title">
            Оформление
          </h1>
          <p className="checkout__lead">
            Сначала контакты и адрес, затем способ получения и оплаты. Стоимость доставки видна до
            подтверждения и входит в итог. Подтверждение сохранится в этом браузере: магазин не получит
            уведомление, оплата не будет проведена.
          </p>
        </header>

        <div className="checkout__layout">
          <form
            id={formId}
            ref={formRef}
            className="checkout__form"
            noValidate
            onSubmit={submit}
          >
            {Object.keys(errors).length > 0 ? (
              <p className="checkout__form-error" role="alert">
                Проверьте выделенные поля.
              </p>
            ) : null}
            {saveError ? (
              <p className="checkout__form-error" role="alert">
                {saveError}
              </p>
            ) : null}

            <fieldset className="checkout__section">
              <legend>1. Контакты</legend>
              <div className="checkout__grid">
                <Field
                  id={`${formId}-first-name`}
                  label="Имя"
                  autoComplete="given-name"
                  value={form.firstName}
                  error={errors.firstName}
                  onChange={update('firstName')}
                />
                <Field
                  id={`${formId}-last-name`}
                  label="Фамилия"
                  autoComplete="family-name"
                  value={form.lastName}
                  error={errors.lastName}
                  onChange={update('lastName')}
                />
                <Field
                  id={`${formId}-email`}
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  error={errors.email}
                  onChange={update('email')}
                />
                <Field
                  id={`${formId}-phone`}
                  label="Телефон"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  error={errors.phone}
                  onChange={update('phone')}
                />
              </div>
            </fieldset>

            <fieldset className="checkout__section">
              <legend>2. Адрес</legend>
              <div className="checkout__grid">
                <Field
                  id={`${formId}-country`}
                  label="Страна"
                  autoComplete="country-name"
                  value={form.country}
                  error={errors.country}
                  onChange={update('country')}
                />
                <Field
                  id={`${formId}-city`}
                  label="Город"
                  autoComplete="address-level2"
                  value={form.city}
                  error={errors.city}
                  onChange={update('city')}
                />
                <Field
                  id={`${formId}-street`}
                  label="Улица"
                  autoComplete="address-line1"
                  value={form.street}
                  error={errors.street}
                  onChange={update('street')}
                />
                <Field
                  id={`${formId}-house`}
                  label="Дом"
                  value={form.house}
                  error={errors.house}
                  onChange={update('house')}
                />
                <Field
                  id={`${formId}-apartment`}
                  label="Квартира"
                  hint="Необязательно"
                  autoComplete="address-line2"
                  value={form.apartment}
                  onChange={update('apartment')}
                />
                <Field
                  id={`${formId}-postal-code`}
                  label="Почтовый индекс"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  value={form.postalCode}
                  error={errors.postalCode}
                  onChange={update('postalCode')}
                />
                <div className="checkout__field checkout__field--wide">
                  <label htmlFor={`${formId}-comment`}>
                    Комментарий к заказу
                    <span className="checkout__hint">Необязательно</span>
                  </label>
                  <textarea
                    id={`${formId}-comment`}
                    name="comment"
                    value={form.comment}
                    autoComplete="off"
                    onChange={(event) => update('comment')(event.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="checkout__section">
              <legend>3. Доставка</legend>
              <p className="checkout__note">
                Срок и район доставки здесь не выбираются. В итог входит только цена способа.
              </p>
              <div className="checkout__choices">
                {deliveryOptions.map((option) => (
                  <label key={option.id} className="checkout__choice">
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={form.delivery === option.id}
                      onChange={() => update('delivery')(option.id)}
                    />
                    <span className="checkout__choice-copy">
                      <span>{option.label}</span>
                      <span>{formatPrice(option.cost)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="checkout__section">
              <legend>4. Оплата</legend>
              <p className="checkout__note">
                Банковская карта — выбранный способ, не списание. Номер карты не запрашивается.
              </p>
              <div className="checkout__choices">
                {paymentOptions.map((option) => (
                  <label key={option.id} className="checkout__choice">
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      checked={form.payment === option.id}
                      onChange={() => update('payment')(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="checkout__submit-row">
              <p className="checkout__note">
                Кнопка записывает заказ на этом устройстве. Она не отправляет его продавцу и не
                проводит оплату.
              </p>
              <button className="checkout__submit" type="submit" disabled={placing}>
                Записать заказ
              </button>
            </div>
          </form>

          <OrderSummary
            lines={resolvedLines}
            shipping={shipping}
            total={total}
            goodsTotal={summary.goodsTotal}
            delivery={form.delivery}
            payment={form.payment}
          />
        </div>
      </div>
    </section>
  )
}

function CheckoutSuccess({ order }: { order: StoredOrder }) {
  const catalog = getProducts()
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0)
  const shipping = deliveryCost(order.delivery)
  const createdAt = formatOrderDate(order.createdAt)

  return (
    <section className="checkout section" aria-labelledby="checkout-success-title">
      <div className="container-narrow checkout__success">
        <p className="checkout__kicker">FORMA</p>
        <h1 id="checkout-success-title" className="checkout__title">
          Заказ записан на этом устройстве
        </h1>
        <p className="checkout__number">{order.number}</p>
        <p className="checkout__lead">
          Номер {order.number} сохранён в браузере. Магазин не получил уведомление, оплата не
          проведена. Отметка «{demoOrderStatusLabels[order.status]}» записана вместе с заказом и
          сама не меняется.
        </p>
        <dl className="checkout__facts">
          <div>
            <dt>Дата</dt>
            <dd>{createdAt}</dd>
          </div>
          <div>
            <dt>Отметка</dt>
            <dd>{demoOrderStatusLabels[order.status]}</dd>
          </div>
          <div>
            <dt>Доставка</dt>
            <dd>
              {deliveryLabel(order.delivery)}, {formatPrice(shipping)}
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
        <ul className="checkout__items">
          {order.lines.map((line, index) => (
            <li key={`${line.productId}-${index}`}>
              <RecordedLine line={line} catalog={catalog} loading={index === 0 ? 'eager' : 'lazy'} />
            </li>
          ))}
        </ul>
        <div className="checkout__empty-actions">
          <Link className="checkout__submit" to={`/orders/${encodeURIComponent(order.number)}`}>
            Открыть заказ
          </Link>
          <Link className="checkout__text-link" to="/orders">
            История заказов
          </Link>
          <Link className="checkout__text-link" to="/catalog">
            Вернуться в каталог
          </Link>
        </div>
      </div>
    </section>
  )
}

function CheckoutEmpty() {
  return (
    <section className="checkout section" aria-labelledby="checkout-empty-title">
      <div className="container-narrow checkout__success">
        <p className="checkout__kicker">FORMA</p>
        <h1 id="checkout-empty-title" className="checkout__title">
          Корзина пуста
        </h1>
        <p className="checkout__lead">
          Записывать заказ не из чего. Сначала добавьте товар в корзину.
        </p>
        <div className="checkout__empty-actions">
          <Link className="checkout__submit" to="/catalog">
            Перейти в каталог
          </Link>
          <Link className="checkout__text-link" to="/orders">
            История заказов
          </Link>
          <Link className="checkout__text-link" to="/cart">
            Вернуться в корзину
          </Link>
        </div>
      </div>
    </section>
  )
}

function OrderSummary({
  lines,
  shipping,
  total,
  goodsTotal,
  delivery,
  payment,
}: {
  lines: ReturnType<typeof resolveCartLines>
  shipping: number
  total: number
  goodsTotal: number
  delivery: CheckoutForm['delivery']
  payment: CheckoutForm['payment']
}) {
  return (
    <aside className="checkout__summary" aria-labelledby="checkout-summary-title">
      <h2 id="checkout-summary-title">Ваш заказ</h2>
      <ul className="checkout__items">
        {lines.map((line, index) => (
          <li key={line.productId}>
            <OrderItem line={line} loading={index === 0 ? 'eager' : 'lazy'} />
          </li>
        ))}
      </ul>
      <dl className="checkout__facts">
        <div>
          <dt>Товары</dt>
          <dd>{formatPrice(goodsTotal)}</dd>
        </div>
        <div>
          <dt>Доставка</dt>
          <dd>
            {deliveryLabel(delivery)}, {formatPrice(shipping)}
          </dd>
        </div>
        <div>
          <dt>Оплата</dt>
          <dd>{paymentLabel(payment)}</dd>
        </div>
        <div className="checkout__sum">
          <dt>Итого</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </aside>
  )
}

function RecordedLine({
  line,
  catalog,
  loading,
}: {
  line: StoredOrder['lines'][number]
  catalog: ReturnType<typeof getProducts>
  loading: 'eager' | 'lazy'
}) {
  const product = catalog.find((item) => item.id === line.productId)
  const image = product?.images[0]

  return (
    <article className="checkout__item">
      <div className="checkout__thumb">
        {image ? (
          <ProductPhoto image={image} alt="" presentation="thumb" loading={loading} />
        ) : null}
      </div>
      <div className="checkout__item-copy">
        <p className="checkout__item-name">{product?.name ?? 'Позиция заказа'}</p>
        <p className="checkout__item-meta">
          {line.quantity} шт. · {formatPrice(line.unitPrice)}
        </p>
      </div>
      <p className="checkout__item-price">{formatPrice(line.unitPrice * line.quantity)}</p>
    </article>
  )
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

function OrderItem({
  line,
  loading,
}: {
  line: ReturnType<typeof resolveCartLines>[number]
  loading: 'eager' | 'lazy'
}) {
  const image = line.product.images[0]

  return (
    <article className="checkout__item">
      <div className="checkout__thumb">
        {image ? (
          <ProductPhoto image={image} alt="" presentation="thumb" loading={loading} />
        ) : null}
      </div>
      <div className="checkout__item-copy">
        <p className="checkout__item-name">{line.product.name}</p>
        <p className="checkout__item-meta">{line.quantity} шт.</p>
      </div>
      <p className="checkout__item-price">{formatPrice(line.lineTotal)}</p>
    </article>
  )
}

function Field({
  id,
  label,
  value,
  error,
  hint,
  type = 'text',
  autoComplete,
  inputMode,
  onChange,
}: {
  id: string
  label: string
  value: string
  error?: string
  hint?: string
  type?: 'text' | 'email' | 'tel'
  autoComplete?: string
  inputMode?: 'numeric'
  onChange: (value: string) => void
}) {
  const errorId = `${id}-error`

  return (
    <div className="checkout__field">
      <label htmlFor={id}>
        {label}
        {hint ? <span className="checkout__hint">{hint}</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="checkout__error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
