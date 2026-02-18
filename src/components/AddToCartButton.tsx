"use client";

import { useCart } from "@/context/CartContext";

interface Props {
  productId: string;
  className?: string;
}

export default function AddToCartButton({ productId, className }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      data-testid="add-to-cart-btn"
      onClick={() => addToCart(productId)}
      className={`
        inline-flex items-center justify-center
        h-11 w-full
        rounded-xl
        text-sm font-semibold
        bg-stone-900 text-white
        shadow-sm
        transition
        hover:bg-stone-800
        active:scale-[0.98]
        ${className ?? ""}
      `}
    >
      Add to Cart
    </button>
  );
}
