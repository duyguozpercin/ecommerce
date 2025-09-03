import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import { collections } from "@/utils/firebase";

// 1. SİPARİŞİ VERİTABANINA KAYDEDEN FONKSİYON
export const createOrder = async (userId: string, orderData: any) => {
  const newOrderRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("orders")
    .doc();

  // ✅ orderData içindeki varsa hatalı createdAt alanını dışla
  const { createdAt, ...safeOrderData } = orderData;

  const finalOrderData = {
    ...safeOrderData,
    id: newOrderRef.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ Firestore Timestamp
  };

  await newOrderRef.set(finalOrderData);

  console.log(`✅ Order ${newOrderRef.id} created for user ${userId}.`);
  return newOrderRef.id;
};

// 2. STOK GÜNCELLEME FONKSİYONU
interface ItemToUpdate {
  productId: string;
  quantity: number;
}

export const updateProductStocks = async (items: ItemToUpdate[]) => {
  if (!items || items.length === 0) return;

  await adminDb.runTransaction(async (transaction) => {
    for (const item of items) {
      if (!item.productId || !item.quantity) continue;

      const productRef = adminDb
        .collection(collections.products)
        .doc(item.productId);

      const incrementValue = admin.firestore.FieldValue.increment(-item.quantity);

      transaction.update(productRef, { stock: incrementValue });
    }
  });

  console.log("📦 Product stocks updated via transaction.");
};
