"use server";

import { doc, deleteDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { del } from "@vercel/blob";

type DeleteResult =
  | { success: true }
  | { success: false; message: string };

export async function deleteProductAction(
  productId: string,
  imageUrl?: string
): Promise<DeleteResult> {
  try {

    await deleteDoc(doc(db, collections.products, productId));


    if (imageUrl) {
      await del(imageUrl, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("🔥 Error deleting product:", error);
    return { success: false, message: "Product could not be deleted." };
  }
}
