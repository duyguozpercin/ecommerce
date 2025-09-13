'use client';

import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';

interface Props {
  product: Product & { id: string };
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      data-testid="add-to-cart-btn"
      className="bg-[#c6937b] text-white px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 text-sm"
      onClick={() => addToCart(product.id)}
    >
      Add to Cart
    </button>
  );
}
