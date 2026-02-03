'use client';

import { useCart } from '@/context/CartContext';

interface Props {
  productId: string;
}

export default function AddToCartButton({ productId }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      data-testid="add-to-cart-btn"
      className="bg-[#c6937b] text-white px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 text-sm"
      onClick={() => addToCart(productId)}
    >
      Add to Cart
    </button>
  );
}
