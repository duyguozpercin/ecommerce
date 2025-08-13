'use client';

import { createCheckoutSession } from '@/app/actions/stripe';
import { Product } from '@/types/product';
import { useTransition } from 'react';

interface CartItemWithDetails extends Product {
  quantity: number;
}

interface CheckoutButtonProps {
  items: CartItemWithDetails[];
}

export function CheckoutButton({ items }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      await createCheckoutSession(items);
    });
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isPending || items.length === 0}
      className="ml-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 cursor-pointer disabled:bg-gray-400"
    >
      {isPending ? 'Processing...' : 'Proceed to Checkout'}
    </button>
  );
}