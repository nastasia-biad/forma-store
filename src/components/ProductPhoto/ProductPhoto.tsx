import type { ProductImage } from '../../types/product.ts'

const cardSizes = '(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw'

type ProductPhotoProps = {
  image: ProductImage
  alt: string
  presentation: 'card' | 'hero' | 'thumb'
  loading?: 'eager' | 'lazy'
  full?: boolean
  className?: string
}

export function ProductPhoto({
  image,
  alt,
  presentation,
  loading = 'lazy',
  full = false,
  className,
}: ProductPhotoProps) {
  const hero = presentation === 'hero'
  const src = hero || full ? image.src : image.preview

  return (
    <img
      className={className}
      src={src}
      srcSet={presentation === 'card' ? `${image.preview} 960w, ${image.src} 1152w` : undefined}
      sizes={presentation === 'card' ? cardSizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={hero || loading === 'eager' ? 'eager' : 'lazy'}
      decoding={hero ? 'auto' : 'async'}
      fetchPriority={hero ? 'high' : undefined}
    />
  )
}
