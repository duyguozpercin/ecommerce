// DOSYA: ./src/app/actions/firebase.ts (DÜZENLENMİŞ HALİ)

import { adminDb } from '@/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// HATA 1 DÜZELTMESİ: 'any' yerine kullanılacak olan tipleri burada tanımlıyoruz.
// Bu tipler, webhook'tan gelen verinin yapısıyla eşleşmelidir.
interface StockItem {
  productId: string;
  quantity: number;
}

interface OrderData {
  userId: string;
  total: number | null;
  currency: string | null;
  shippingDetails: any; // Gelen veri karmaşık olabileceğinden şimdilik 'any' kalabilir veya daha detaylı bir tip oluşturulabilir.
  paymentStatus: string;
  products: { productId: string; quantity: number }[];
}

/**
 * Başarılı bir ödeme sonrası Firestore'da yeni bir sipariş belgesi oluşturur.
 * @param userId - Siparişi veren kullanıcının ID'si.
 * @param orderData - Webhook'tan gelen ve sipariş detaylarını içeren obje.
 */
export const createOrder = async (userId: string, orderData: OrderData) => {
  // HATA 1 DÜZELTMESİ: Fonksiyon parametresi artık 'any' değil, yukarıda tanımladığımız 'OrderData' tipini kullanıyor.

  // HATA 2 DÜZELTMESİ: Kullanılmayan 'createdAt' değişkeni artık burada hiç çağrılmıyor.
  // Sadece ihtiyacımız olan alanları alıyoruz.
  const { total, currency, shippingDetails, paymentStatus, products } = orderData;

  const newOrderPayload = {
    userId,
    total: total ? total / 100 : 0, // Stripe'tan gelen tutarı (kuruş) 100'e bölüyoruz.
    currency,
    shippingDetails,
    paymentStatus,
    products,
    timestamp: FieldValue.serverTimestamp(), // Siparişin oluşturulma tarihini Firestore'un sunucu zamanı ile belirliyoruz.
  };

  await adminDb
    .collection('users')
    .doc(userId)
    .collection('orders')
    .add(newOrderPayload);

  console.log(`Firebase: Kullanıcı ${userId} için yeni sipariş oluşturuldu.`);
};

/**
 * Satın alınan ürünlerin stoklarını Firestore'da günceller.
 * @param items - Stokları güncellenecek ürünlerin listesi (productId ve quantity).
 */
export const updateProductStocks = async (items: StockItem[]) => {
  if (!items || items.length === 0) {
    console.log('Firebase: Stokları güncellenecek ürün bulunamadı.');
    return;
  }

  // Birden fazla yazma işlemini tek seferde yapmak için 'batch' kullanmak en verimli yöntemdir.
  const batch = adminDb.batch();

  items.forEach(item => {
    const productRef = adminDb.collection('products').doc(item.productId);
    // FieldValue.increment ile mevcut stoktan belirtilen adedi düşürüyoruz.
    batch.update(productRef, { stock: FieldValue.increment(-item.quantity) });
  });

  await batch.commit();
  console.log(`Firebase: ${items.length} adet ürünün stoğu başarıyla güncellendi.`);
};