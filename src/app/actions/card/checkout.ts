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

  // session değişkenini try bloğunun dışında tanımlıyoruz.
  let session;

  try {
    // line_items değişkenini burada tanımlıyoruz ki transaction içinden doldurabilelim.
    let line_items: any[] = [];

    // Firestore transaction'ı başlatıyoruz.
    // Bu, stok kontrolü ve güncelleme işlemlerinin hepsinin başarılı olmasını
    // veya bir hata durumunda hiçbirinin uygulanmamasını garanti eder.
    await adminDb.runTransaction(async (transaction) => {
      const items_for_stripe = await Promise.all(
        cartItems.map(async (item) => {
          const productRef = adminDb.collection('products').doc(item.id);
          const productSnap = await transaction.get(productRef); // Okuma işlemini transaction içinde yap

          if (!productSnap.exists) {
            throw new Error(`Ürün bulunamadı: ${item.id}`);
          }

          const productData = productSnap.data()!;
          const currentStock = productData.stock;

          // Stok alanı var mı diye kontrol et
          if (currentStock === undefined) {
            throw new Error(`Ürün için stok bilgisi eksik: ${item.id}`);
          }
          
          // Yeterli stok var mı diye kontrol et
          if (currentStock < item.quantity) {
            throw new Error(`Yetersiz stok: ${productData.name}. Kalan: ${currentStock}, İstenen: ${item.quantity}`);
          }
          
          if (!productData.stripePriceId) {
            throw new Error(`stripePriceId bilgisi eksik: ${item.id}`);
          }

          // Stok güncelleme işlemini transaction'a ekle
          transaction.update(productRef, { stock: FieldValue.increment(-item.quantity) });

          return {
            price: productData.stripePriceId,
            quantity: item.quantity,
          };
        })
      );
      // Başarılı olursa, line_items dizisini doldur
      line_items = items_for_stripe;
    });

    // NOT: Bu yaklaşım, kullanıcı Stripe'da ödemeyi tamamlamasa bile stoğu düşürür.
    // Daha sağlam bir çözüm için (üretim ortamında tavsiye edilen), ödeme başarılı
    // olduktan sonra stoğu düşüren bir Stripe Webhook kurmanız gerekir.

    // Stripe oturumunu, stok kontrolü yapılmış ve güncellenmiş ürünlerle oluştur.
    session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      client_reference_id: userId,
    });

  } catch (err: any) {
    console.error('Ödeme işlemi sırasında hata:', err);
    // Hata mesajını kullanıcıya göstermek için URL'e ekleyebiliriz.
    const errorMessage = encodeURIComponent(err.message);
    return redirect(`/cart?error=checkout_failed&message=${errorMessage}`);
  }

  // KONTROL VE YÖNLENDİRME ARTIK TRY...CATCH BLOĞUNUN DIŞINDA
  if (session?.url) {
    // Her şey başarılıysa, Stripe'a yönlendiriyoruz.
    redirect(session.url);
  } else {
    // Eğer bir şekilde session veya url yoksa, bu da bir hatadır.
    console.error('Stripe oturumu oluşturuldu ancak URL eksik.');
    redirect(`/cart?error=session_url_missing`);
  }
}

