'use server';

import { stripe } from '@/utils/stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
// Sunucu tarafı işlemler için 'adminDb' kullanmak daha güvenli ve doğrudur.
import { adminDb } from '@/utils/firebase-admin';

interface CartItem {
  id: string;
  quantity: number;
}

// Form verisinden hem sepet ürünlerini hem de userId'yi ayrıştıran yardımcı fonksiyon
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
  
  // 1. Form verisinden hem ürünleri hem de KULLANICI KİMLİĞİNİ al
  const { cartItems, userId } = parseFormData(formData);

  if (!userId) {
    throw new Error('User is not logged in. Cannot proceed to checkout.');
  }
  
  if (cartItems.length === 0) {
    throw new Error('No valid cart items found.');
  }

  try {
    // 2. Firestore'dan her ürünün Stripe priceId'sini yönetici yetkileriyle çek
    const line_items = await Promise.all(
      cartItems.map(async (item) => {
        // 'db' yerine 'adminDb' kullanıyoruz
        const productRef = adminDb.collection('products').doc(item.id);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
          throw new Error(`Product not found in Firestore: ${item.id}`);
        }

        const productData = productSnap.data();
        if (!productData?.stripePriceId) {
          throw new Error(`stripePriceId is missing for product: ${item.id}`);
        }

        return {
          price: productData.stripePriceId,
          quantity: item.quantity,
        };
      })
    );

    // 3. Stripe checkout oturumu oluştururken userId'yi de ekle
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      
      // KRİTİK DÜZELTME: Kullanıcı kimliğini Stripe'a bildiriyoruz
      client_reference_id: userId,
    });

    if (session.url) {
      redirect(session.url);
    } else {
      throw new Error('Session URL is null');
    }

  } catch (err) {
    console.error('Error creating checkout session', err);
    // Hata durumunda daha anlaşılır bir mesaja yönlendirebiliriz
    redirect(`/cart?error=checkout_failed`);
  }
}
