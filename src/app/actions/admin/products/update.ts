"use server";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import type { Product } from "@/types/product";
import { productSchema, formDataToRawProduct } from "./schema";
import { put } from "@vercel/blob";

const zodIssues = (err: any): { path: string; message: string }[] =>
  err.issues.map((i: any) => ({
    path: i.path.join("."),
    message: i.message,
  }));

type ActionOk = { success: true; message: string; stripePriceId?: string };
type ActionErr = { success: false; message: string; issues?: { path: string; message: string }[] };
type ActionResult = ActionOk | ActionErr;

export async function updateProductAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = formDataToRawProduct(formData);
    const parsed = productSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        issues: zodIssues(parsed.error),
      };
    }

    const data = parsed.data;
    if (!data.id) return { success: false, message: "Missing product id" };

    
    const ref = doc(db, collections.products, data.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, message: "Product not found" };
    const existing = { id: snap.id, ...snap.data() } as Product;

    
    let imageUrl = data.image ?? "";
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const MAX = 4.5 * 1024 * 1024;
      const okTypes = ["image/jpeg", "image/jpg", "image/webp", "image/png"];
      if (!okTypes.includes(imageFile.type)) {
        return { success: false, message: "Invalid image format" };
      }
      if (imageFile.size > MAX) {
        return { success: false, message: "Image size must be under 4.5MB" };
      }
      const imageName = `${data.id}.${imageFile.name.split(".").pop()}`;
      try {
        const blob = await put(imageName, imageFile, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        imageUrl = blob.url;
      } catch (err) {
        console.error("Image upload error:", err);
        return { success: false, message: "Image upload failed" };
      }
    }

    
    const oldPrice = Number(existing.price ?? 0);
    const newPrice = Number(data.price);
    let stripePriceId: string | undefined = existing.stripePriceId;

    if (oldPrice !== newPrice && existing.stripeProductId) {
      if (existing.stripePriceId) {
        try {
          await stripe.prices.update(existing.stripePriceId, { active: false });
        } catch {
          
        }
      }
      try {
        const currency = existing.stripeCurrency || process.env.STRIPE_CURRENCY || "usd";
        const created = await stripe.prices.create({
          product: existing.stripeProductId!,
          unit_amount: Math.round(newPrice * 100),
          currency,
        });
        stripePriceId = created.id;
        await stripe.products.update(existing.stripeProductId!, { default_price: stripePriceId });
      } catch {
        return { success: false, message: "Stripe price update failed." };
      }
    }

   
    const meta = typeof existing.meta === "object" && existing.meta ? existing.meta : {};
    const updatePayload: Record<string, unknown> = {
      title: data.title,
      category: data.category,
      price: newPrice,
      stock: data.stock,
      meta: { ...meta, updatedAt: new Date().toISOString() },
    };

    if (data.description) updatePayload.description = data.description;
    if (data.brand) updatePayload.brand = data.brand;
    if (data.sku) updatePayload.sku = data.sku;
    if (data.weight) updatePayload.weight = data.weight;
    if (data.warrantyInformation) updatePayload.warrantyInformation = data.warrantyInformation;
    if (data.shippingInformation) updatePayload.shippingInformation = data.shippingInformation;
    if (data.availabilityStatus) updatePayload.availabilityStatus = data.availabilityStatus;
    if (data.returnPolicy) updatePayload.returnPolicy = data.returnPolicy;
    if (data.dimensions) updatePayload.dimensions = data.dimensions;
    if (data.tags) updatePayload.tags = data.tags;
    if (imageUrl) {
      updatePayload.images = [imageUrl];
      updatePayload.thumbnail = imageUrl;
    }
    if (stripePriceId) updatePayload.stripePriceId = stripePriceId;

    await updateDoc(ref, JSON.parse(JSON.stringify(updatePayload)));

    return { success: true, message: "Product updated successfully", stripePriceId };
  } catch (err) {
    console.error("updateProductAction error:", err);
    return { success: false, message: "Unexpected server error." };
  }
}
