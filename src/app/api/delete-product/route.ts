import { del } from "@vercel/blob";
import { db, collections } from "@/utils/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    const productRef = doc(db, collections.products, productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const productData = productSnap.data();

      if (productData.images && Array.isArray(productData.images)) {
        for (const url of productData.images) {
          await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
        }
      }

      await deleteDoc(productRef);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
