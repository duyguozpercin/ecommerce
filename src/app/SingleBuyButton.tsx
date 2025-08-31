'use client';

import { checkout } from '@/app/actions/card/checkout';

export const SingleBuyButton = ({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) => {
  return (
    <form action={checkout}>
      <input type="hidden" name="cartItems[0][id]" value={productId} />
      <input type="hidden" name="cartItems[0][quantity]" value="1" />
      <button
        type="submit"
        className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ""}`}
      >
        Buy Now
      </button>
    </form>
  );
};
