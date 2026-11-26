export type DeliveryMethod = 'standard' | 'express'

export type PaymentMethod = 'on-delivery' | 'card'

export type CheckoutForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  street: string
  house: string
  apartment: string
  postalCode: string
  comment: string
  delivery: DeliveryMethod
  payment: PaymentMethod
}

export type CheckoutErrors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'country'
    | 'city'
    | 'street'
    | 'house'
    | 'postalCode'
    | 'delivery'
    | 'payment',
    string
  >
>

export type DemoOrderLine = {
  productId: string
  quantity: number
}

export type DemoOrder = {
  number: string
  firstName: string
  lastName: string
  city: string
  delivery: DeliveryMethod
  payment: PaymentMethod
  lines: readonly DemoOrderLine[]
}

export const deliveryOptions: readonly {
  id: DeliveryMethod
  label: string
  cost: number
}[] = [
  { id: 'standard', label: 'Стандартная доставка', cost: 0 },
  { id: 'express', label: 'Ускоренная доставка', cost: 0 },
]

export const paymentOptions: readonly { id: PaymentMethod; label: string }[] = [
  { id: 'on-delivery', label: 'При получении' },
  { id: 'card', label: 'Банковская карта' },
]

export const emptyCheckoutForm: CheckoutForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  street: '',
  house: '',
  apartment: '',
  postalCode: '',
  comment: '',
  delivery: 'standard',
  payment: 'on-delivery',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {}

  if (form.firstName.trim().length < 2) {
    errors.firstName = 'Укажите имя'
  }

  if (form.lastName.trim().length < 2) {
    errors.lastName = 'Укажите фамилию'
  }

  if (form.email.trim().length === 0) {
    errors.email = 'Укажите email'
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Проверьте адрес email'
  }

  if (form.phone.trim().length === 0) {
    errors.phone = 'Укажите телефон'
  } else if (!isPhone(form.phone)) {
    errors.phone = 'Проверьте номер телефона'
  }

  if (form.country.trim().length < 2) {
    errors.country = 'Укажите страну'
  }

  if (form.city.trim().length < 2) {
    errors.city = 'Укажите город'
  }

  if (form.street.trim().length < 2) {
    errors.street = 'Укажите улицу'
  }

  if (form.house.trim().length === 0) {
    errors.house = 'Укажите дом'
  }

  if (!/^\d{4,10}$/.test(form.postalCode.replace(/\s/g, ''))) {
    errors.postalCode = 'Проверьте почтовый индекс'
  }

  if (!deliveryOptions.some((option) => option.id === form.delivery)) {
    errors.delivery = 'Выберите способ доставки'
  }

  if (!paymentOptions.some((option) => option.id === form.payment)) {
    errors.payment = 'Выберите способ оплаты'
  }

  return errors
}

export function deliveryCost(method: DeliveryMethod): number {
  return deliveryOptions.find((option) => option.id === method)?.cost ?? 0
}

export function deliveryLabel(method: DeliveryMethod): string {
  return deliveryOptions.find((option) => option.id === method)?.label ?? ''
}

export function paymentLabel(method: PaymentMethod): string {
  return paymentOptions.find((option) => option.id === method)?.label ?? ''
}

export function createDemoOrderNumber(now = new Date()): string {
  return `FM-${now.getTime().toString(36).toUpperCase().slice(-6)}`
}

export function placeDemoOrder(
  form: CheckoutForm,
  lines: readonly DemoOrderLine[],
  now = new Date(),
): DemoOrder | null {
  if (lines.length === 0 || Object.keys(validateCheckout(form)).length > 0) {
    return null
  }

  return {
    number: createDemoOrderNumber(now),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    city: form.city.trim(),
    delivery: form.delivery,
    payment: form.payment,
    lines: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
  }
}

function isPhone(value: string): boolean {
  const trimmed = value.trim()

  if (!/^[+\d][\d\s()-]*$/.test(trimmed)) {
    return false
  }

  const digits = trimmed.replace(/\D/g, '')

  return digits.length >= 10 && digits.length <= 15
}
