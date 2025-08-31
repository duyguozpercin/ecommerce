'use server';

import { stripe } from '@/utils/stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface CartItem {
  id: string;
  quantity: number;
}

export async function checkout(formData: FormData) {
  const origin = (await headers()).get('origin');
  const cartItems: CartItem[] = [];

  // 1. Form verisinden tüm ürünleri al
  for (let i = 0; ; i++) {
    const id = formData.get(`cartItems[${i}][id]`);
    const quantity = formData.get(`cartItems[${i}][quantity]`);
    if (!id || !quantity) break;

    cartItems.push({ id: String(id), quantity: Number(quantity) });
  }

  if (cartItems.length === 0) {
    throw new Error('No valid cart items found.');
  }

  try {
    // 2. Firestore'dan her ürünün Stripe priceId'sini çek
    const line_items = [];

    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error(`Product not found in Firestore: ${item.id}`);
      }

      const productData = productSnap.data();

      if (!productData.stripePriceId) {
        throw new Error(`stripePriceId is missing for product: ${item.id}`);
      }

      line_items.push({
        price: productData.stripePriceId,
        quantity: item.quantity,
      });
    }

    // 3. Stripe checkout oturumu oluştur
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        items: JSON.stringify(cartItems),
      },
    });

    if (session.url) {
      redirect(session.url);
    } else {
      throw new Error('Session URL is null');
    }

  } catch (err) {
    console.error('Error creating checkout session', err);
    throw err;
  }
}
