"use server";

import { doc, deleteDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { del } from "@vercel/blob"; // Eğer ürün görsellerini blob’a yüklüyorsan

export async function deleteProductAction(productId: string, imageUrl?: string) {
  try {
    // ✅ Firestore’dan ürünü sil
    await deleteDoc(doc(db, collections.products, productId));

    // ✅ Görsel varsa blob’dan sil
    if (imageUrl) {
      await del(imageUrl);
    }

    return { success: true };
  } catch (error) {
    console.error("🔥 Error deleting product:", error);
    return { success: false, message: "Product could not be deleted." };
  }
}
