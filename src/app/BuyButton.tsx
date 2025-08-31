'use client';

import { checkout } from '@/app/actions/card/checkout';

interface CartItemInput {
  id: string;
  quantity: number;
}

interface BuyButtonProps {
  cartItems: CartItemInput[];
  className?: string;
}

export const BuyButton = ({ cartItems, className }: BuyButtonProps) => {
  if (!Array.isArray(cartItems)) {
    console.error("BuyButton: cartItems is undefined or not an array.");
    return null;
  }

  return (
    <form action={checkout}>
      {cartItems.map((item, index) => (
        <div key={index}>
          <input type="hidden" name={`cartItems[${index}][id]`} value={item.id} />
          <input
            type="hidden"
            name={`cartItems[${index}][quantity]`}
            value={item.quantity.toString()} // quantity sayısal olduğu için toString gerekli
          />
        </div>
      ))}

      <button
        type="submit"
        className={className ?? 'text-[#49739c] text-sm font-normal leading-normal'}
      >
        Buy Now
      </button>
    </form>
  );
};
