export const productCategories = {
  furniture: 'Мебель',
  accessories: 'Аксессуары',
} as const

export type ProductCategory = keyof typeof productCategories

/** Full frame and smaller frame. Both values are URLs. */
export type ProductImage = {
  src: string
  preview: string
  width: number
  height: number
}

export type Product = {
  id: string
  name: string
  slug: string
  price: number
  category: ProductCategory
  subcategory: string
  description: string
  images: ProductImage[]
  material: string
  color: string
  dimensions: string
  isFavorite: boolean
  isNew: boolean
  isBestseller: boolean
}
