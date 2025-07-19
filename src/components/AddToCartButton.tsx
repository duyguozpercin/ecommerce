'use client';

import { useCart } from 'src/app/context/CartContext';
import { Product } from '@/types/product';

interface Props {
  product: Product & { id: string };
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
      onClick={() => addToCart(product.id)}
    >
      Add to Cart
    </button>
  );
}
