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
        className={className ?? 'text-[#49739c] text-sm font-normal leading-normal'}
      >
        Buy Now
      </button>
    </form>
  );
};
