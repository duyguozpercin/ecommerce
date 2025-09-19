"use server";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import type { Product } from "@/types/product";
import { productSchema, formDataToRawProduct } from "./schema";

const isNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

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

    // ✅ Firestore mevcut ürün
    const ref = doc(db, collections.products, data.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, message: "Product not found" };
    const existing = { id: snap.id, ...snap.data() } as Product;

    // ✅ Stripe fiyat güncelleme
    const oldPrice = Number(existing.price ?? 0);
    const newPrice = Number(data.price);
    let stripePriceId: string | undefined = existing.stripePriceId;

    if (oldPrice !== newPrice && existing.stripeProductId) {
      if (existing.stripePriceId) {
        try {
          await stripe.prices.update(existing.stripePriceId, { active: false });
        } catch { /* ignore */ }
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

    // ✅ Update payload
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
    if (data.image) {
      updatePayload.images = [data.image];
      updatePayload.thumbnail = data.image;
    }
    if (stripePriceId) updatePayload.stripePriceId = stripePriceId;

    await updateDoc(ref, JSON.parse(JSON.stringify(updatePayload)));

    return { success: true, message: "Product updated successfully", stripePriceId };
  } catch (err) {
    console.error("updateProductAction error:", err);
    return { success: false, message: "Unexpected server error." };
  }
}
