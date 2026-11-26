export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatItemCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  const noun =
    mod10 === 1 && mod100 !== 11
      ? 'предмет'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'предмета'
        : 'предметов'

  return `${count} ${noun}`
}
