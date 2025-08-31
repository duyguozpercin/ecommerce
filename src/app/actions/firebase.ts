// Admin SDK'sının kendisini import ediyoruz
import admin from 'firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import { collections } from "@/utils/firebase";

// 1. SİPARİŞİ VERİTABANINA KAYDEDEN FONKSİYON
export const createOrder = async (userId: string, orderData: object) => {
  // DİKKAT: Kullanım değişti -> adminDb.collection(...).doc()
  // doc() içine bir şey yazmazsak ID'yi otomatik oluşturur.
  const newOrderRef = adminDb.collection("users").doc(userId).collection("orders").doc();
  
  await newOrderRef.set({
    ...orderData,
    id: newOrderRef.id,
    createdAt: new Date(),
  });
  
  console.log(`Order ${newOrderRef.id} created for user ${userId}.`);
  return newOrderRef.id;
};

// 2. STOK GÜNCELLEME FONKSİYONU
interface ItemToUpdate {
  productId: string;
  quantity: number;
}
export const updateProductStocks = async (items: ItemToUpdate[]) => {
  if (!items || items.length === 0) return;

  // DİKKAT: Kullanım değişti -> adminDb.runTransaction(...)
  await adminDb.runTransaction(async (transaction) => {
    for (const item of items) {
      if (!item.productId || !item.quantity) continue;

      // DİKKAT: Kullanım değişti -> adminDb.doc(...)
      const productRef = adminDb.collection(collections.products).doc(item.productId);
      
      // DİKKAT: increment'in kullanımı da değişti
      const incrementValue = admin.firestore.FieldValue.increment(-item.quantity);
      
      transaction.update(productRef, { stock: incrementValue });
    }
  });

  console.log("Product stocks updated via transaction.");
};