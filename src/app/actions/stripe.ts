
'use server';

import { Product } from '@/types/product';
import { redirect } from 'next/navigation';

import { stripe } from '@/utils/stripe';

interface CartItemWithDetails extends Product {
  quantity: number;
}

export async function createCheckoutSession(items: CartItemWithDetails[]) {
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.title,
        images: [item.thumbnail || item.images[0]],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart?canceled=true`,
    });

    if (session.url) {
      redirect(session.url);
    } else {
      throw new Error('Stripe session URL could not be created.');
    }
  } catch (error) {
    console.error('Stripe checkout session failed:', error);
    throw new Error('Could not create checkout session.');
  }
}