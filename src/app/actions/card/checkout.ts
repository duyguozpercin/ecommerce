// DOSYA: app/actions/card/checkout.ts (DÜZELTİLMİŞ VE DOĞRU HALİ)

'use server';

import { stripe } from '@/utils/stripe';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDb } from '@/utils/firebase-admin';

// FieldValue'ya artık burada ihtiyacımız yok, çünkü stok güncellemesini webhook yapacak.
// import { FieldValue } from 'firebase-admin/firestore'; 

interface CartItem {
  id: string; // Bu ID, Firestore'daki ürün belgesinin ID'si olmalı
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
    // Stripe'a gönderilecek ürün listesini hazırlıyoruz.
    const line_items = await Promise.all(
      cartItems.map(async (item) => {
        const productRef = adminDb.collection('products').doc(item.id);
        const productSnap = await productRef.get(); // Transaction yerine basit bir okuma

        if (!productSnap.exists) {
          throw new Error(`Ürün bulunamadı: ${item.id}`);
        }

        const productData = productSnap.data()!;
        
        // Ödeme oturumunu oluşturmadan ÖNCE stokları KONTROL EDİYORUZ (düşürmüyoruz).
        if (productData.stock < item.quantity) {
          throw new Error(`Yetersiz stok: ${productData.name}. Kalan: ${productData.stock}`);
        }
        
        if (!productData.stripePriceId) {
          throw new Error(`stripePriceId bilgisi eksik: ${item.id}`);
        }

        // DİKKAT: Stok güncelleme (transaction.update) işlemi buradan tamamen kaldırıldı.
        // SEBEP: Bu işlem, ödeme BAŞARILI olduktan sonra webhook tarafından yapılmalıdır.

        return {
          price: productData.stripePriceId,
          quantity: item.quantity,
        };
      })
    );
    
    // Stripe oturumunu oluşturuyoruz.
    session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        cartItems: JSON.stringify(cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
        }))),
      }
    });

  } catch (err: any) {
    // Hata durumunda kullanıcıyı bilgilendirerek sepet sayfasına geri yönlendir.
    console.error('Ödeme oturumu oluşturulurken hata:', err);
    return redirect(`/cart?error=checkout_failed&message=${encodeURIComponent(err.message)}`);
  }

  // DİKKAT: Sepet temizleme mantığı buradan tamamen kaldırıldı.
  // SEBEP: Bu işlem de webhook tarafından, sipariş veritabanına kaydedildikten sonra yapılmalıdır.

  if (session?.url) {
    // Her şey başarılıysa, kullanıcıyı Stripe'ın ödeme sayfasına yönlendiriyoruz.
    redirect(session.url);
  } else {
    // Bu nadir bir durumdur ama yine de ele almalıyız.
    redirect(`/cart?error=session_url_missing`);
  }
}