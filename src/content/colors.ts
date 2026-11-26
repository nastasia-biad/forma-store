/** Explicit swatches for catalog color names. Unknown names are not guessed. */
export const productColorSwatches: Record<string, string> = {
  'Натуральный дуб': 'var(--swatch-natural-oak)',
  'Светлый дуб': 'var(--swatch-light-oak)',
  'Тёплый дуб': 'var(--swatch-warm-oak)',
  Песочный: 'var(--swatch-sand)',
  Оливковый: 'var(--swatch-olive)',
  Латунь: 'var(--swatch-brass)',
}

export function colorSwatch(name: string): string | null {
  return productColorSwatches[name] ?? null
}
