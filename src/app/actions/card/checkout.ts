'use server';

import { stripe } from '@/utils/stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDb } from '@/utils/firebase-admin';

interface CartItem { id: string; quantity: number }

function parseFormData(formData: FormData): { cartItems: CartItem[]; userId: string | null } {
  const cartItems: CartItem[] = [];
  const userId = formData.get('userId') as string | null;

  for (let i = 0; ; i++) {
    const id = formData.get(`cartItems[${i}][id]`);
    const quantity = formData.get(`cartItems[${i}][quantity]`);
    if (!id || !quantity) break;

    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) continue;

    cartItems.push({ id: String(id), quantity: q });
  }

  return { cartItems, userId };
}

export async function checkout(formData: FormData) {
  const hdrs = await headers();
  const origin = hdrs.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const { cartItems, userId } = parseFormData(formData);
  if (!userId) throw new Error('User is not logged in.');
  if (cartItems.length === 0) throw new Error('No valid cart items found.');

  const line_items = await Promise.all(
    cartItems.map(async (item) => {
      const snap = await adminDb.collection('products').doc(item.id).get();
      if (!snap.exists) throw new Error(`Product not found: ${item.id}`);

      const data = snap.data()!;
      const stock = Number(data.stock ?? 0);
      if (!Number.isFinite(stock) || stock < item.quantity) {
        const name = data.title || data.name || item.id;
        throw new Error(`Insufficient stock: ${name}. Remaining: ${stock}`);
      }
      if (!data.stripePriceId) throw new Error(`stripePriceId is missing: ${item.id}`);

      return { price: String(data.stripePriceId), quantity: item.quantity };
    })
  );

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?canceled=true`,
    client_reference_id: userId,
    metadata: {
      userId,
      cartItems: JSON.stringify(cartItems),
    },
  });

  if (!session.url) throw new Error('Stripe session URL could not be created.');
  redirect(session.url);
}
