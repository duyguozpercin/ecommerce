'use server';

import { stripe } from '@/utils/stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDb } from '@/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

  if (!userId) {
    throw new Error('User is not logged in. Cannot proceed to checkout.');
  }
  
  if (cartItems.length === 0) {
    throw new Error('No valid cart items found.');
  }

  let session;

  try {
    let line_items: any[] = [];

    await adminDb.runTransaction(async (transaction) => {
      const items_for_stripe = await Promise.all(
        cartItems.map(async (item) => {
          const productRef = adminDb.collection('products').doc(item.id);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists) {
            throw new Error(`Ürün bulunamadı: ${item.id}`);
          }

          const productData = productSnap.data()!;
          const currentStock = productData.stock;

          if (currentStock === undefined) {
            throw new Error(`Ürün için stok bilgisi eksik: ${item.id}`);
          }
          
          if (currentStock < item.quantity) {
            throw new Error(`Yetersiz stok: ${productData.name}. Kalan: ${currentStock}, İstenen: ${item.quantity}`);
          }
          
          if (!productData.stripePriceId) {
            throw new Error(`stripePriceId bilgisi eksik: ${item.id}`);
          }

          transaction.update(productRef, { stock: FieldValue.increment(-item.quantity) });

          return {
            price: productData.stripePriceId,
            quantity: item.quantity,
          };
        })
      );
      line_items = items_for_stripe;
    });

    session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      client_reference_id: userId,

      // --- İSTEDİĞİNİZ TEK DEĞİŞİKLİK BURADA ---
      // Webhook'un doğru Firestore ID'lerini alabilmesi için bu bilgiyi ekliyoruz.
      // Kodunuzun geri kalanının çalışma mantığını etkilemez.
      metadata: {
        userId: userId,
        cartItems: JSON.stringify(cartItems.map(item => ({
          id: item.id,       // Firestore Ürün ID'si
          quantity: item.quantity,
        }))),
      }
      // --- DEĞİŞİKLİK SONU ---
    });

  } catch (err: any) {
    console.error('Ödeme işlemi sırasında hata:', err);
    const errorMessage = encodeURIComponent(err.message);
    return redirect(`/cart?error=checkout_failed&message=${errorMessage}`);
  }

  if (session?.url) {
    try {
      const cartRef = adminDb.collection('users').doc(userId).collection('cart');
      const cartSnapshot = await cartRef.get();

      if (!cartSnapshot.empty) {
        const batch = adminDb.batch();
        cartSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (clearCartError) {
      console.error(`Could not clear cart for user ${userId}:`, clearCartError);
    }

    redirect(session.url);
  } else {
    console.error('Stripe oturumu oluşturuldu ancak URL eksik.');
    redirect(`/cart?error=session_url_missing`);
  }
}