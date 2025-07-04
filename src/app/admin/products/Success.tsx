import { Product } from '@/types/product'

export const SuccessPage = ({product}: {product?: Partial<Product>}) => {
  if (!product) return (
    <div>
      <h1>The product was added successfully</h1>
    </div>
  );

  return (
    <div>
      <h1>The product was added successfully</h1>

      <span>{product.id}</span>
      <span>{product.title}</span>
      <span>{product.description}</span>
      <span>{product.category}</span>
    </div>
  )
}