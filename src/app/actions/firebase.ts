// 📁 app/actions/firebase.ts

import { adminDb } from '@/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// 👇 Sipariş için kullanılacak veri tipi
interface OrderData {
  userId: string;
  total: number | null;
  currency: string | null;
  shippingDetails: any;
  paymentStatus: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}

// 👇 Stok güncellemesi için kullanılacak ürün tipi
interface StockItem {
  productId: string;
  quantity: number;
}

// ✅ Firestore'a sipariş kaydeden fonksiyon
export const createOrder = async (userId: string, orderData: OrderData) => {
  const { total, currency, shippingDetails, paymentStatus, products } = orderData;

  const newOrderPayload = {
    userId,
    total: total ? total / 100 : 0, // Stripe kuruş cinsinden gönderir, TL'ye çevrilir
    currency,
    shippingDetails,
    paymentStatus,
    products,
    timestamp: FieldValue.serverTimestamp(),
  };

  await adminDb
    .collection('users')
    .doc(userId)
    .collection('orders')
    .add(newOrderPayload);

  console.log(`✅ Firebase: Kullanıcı ${userId} için yeni sipariş oluşturuldu.`);
};

// ✅ Firestore'da stokları güncelleyen fonksiyon
export const updateProductStocks = async (items: StockItem[]) => {
  if (!items?.length) {
    console.log('⚠️ Stokları güncellenecek ürün bulunamadı.');
    return;
  }

  const batch = adminDb.batch();

  items.forEach(({ productId, quantity }) => {
    const productRef = adminDb.collection('products').doc(productId);
    batch.update(productRef, {
      stock: FieldValue.increment(-quantity),
    });
  });

  await batch.commit();
  console.log(`✅ Firestore: ${items.length} ürünün stoğu güncellendi.`);
};
