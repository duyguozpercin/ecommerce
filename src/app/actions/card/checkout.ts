'use server';

import { stripe } from '@/utils/stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDb } from '@/utils/firebase-admin';

interface CartItem {
  id: string;
  quantity: number;
}

function parseFormData(formData: FormData): { cartItems: CartItem[], userId: string | null } {
  const cartItems: CartItem[] = [];
  const userId = formData.get('userId') as string | null;

  for (let i = 0; ; i++) {
    const id = formData.get(`cartItems[${i}][id]`);
    const quantity = formData.get(`cartItems[${i}][quantity]`);
    if (!id || !quantity) break;
    cartItems.push({ id: String(id), quantity: Number(quantity) });
  }
  
  return { cartItems, userId };
}

export async function checkout(formData: FormData) {
  const origin = (await headers()).get('origin');
  const { cartItems, userId } = parseFormData(formData);

  if (!userId) throw new Error('User is not logged in.');
  if (cartItems.length === 0) throw new Error('No valid cart items found.');

  try {
    const line_items = await Promise.all(
      cartItems.map(async (item) => {
        const productRef = adminDb.collection('products').doc(item.id);
        const productSnap = await productRef.get();

        // --- DÜZELTME BURADA ---
        // .exists bir fonksiyon değil, bir özelliktir. Parantezler kaldırıldı.
        if (!productSnap.exists) { 
          throw new Error(`Ürün bulunamadı: ${item.id}`);
        }

        const productData = productSnap.data()!;
        
        if (productData.stock < item.quantity) {
          throw new Error(`Yetersiz stok: ${productData.name}. Kalan: ${productData.stock}`);
        }
        
        if (!productData.stripePriceId) {
          throw new Error(`stripePriceId bilgisi eksik: ${item.id}`);
        }

        return {
          price: productData.stripePriceId,
          quantity: item.quantity,
        };
      })
    );
    
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        cartItems: JSON.stringify(cartItems),
      }
    });

    if (session.url) {
      redirect(session.url);
    } else {
      throw new Error("Stripe session URL could not be created.");
    }

  } catch (err: any) {
    console.error('Ödeme oturumu oluşturulurken hata:', err);
    return redirect(`/cart?error=checkout_failed&message=${encodeURIComponent(err.message)}`);
  }
}
