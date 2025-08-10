'use server';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import { z } from "zod";
import type { Product } from "@/types/product";

// ---- Schemas
const updateSchema = z.object({
  id: z.string().min(1, "Missing product id"),
  title: z.string().min(3).max(100),
  category: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
});

type ActionOk = { success: true; message: string; stripePriceId?: string };
type ActionErr = {
  success: false;
  message: string;
  issues?: { path: string; message: string }[];
};
type ActionResult = ActionOk | ActionErr;

// ---- Helpers
const num = (v: FormDataEntryValue | null) =>
  v == null || v === "" ? undefined : Number(v);

const isNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

const zodIssues = (err: z.ZodError): { path: string; message: string }[] =>
  err.issues.map(i => ({
    path: i.path.join("."),
    message: i.message,
  }));

export async function updateProductAction(formData: FormData): Promise<ActionResult> {
  try {
    // 1) Raw form parse
    const raw = {
      id: String(formData.get("id") || ""),
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      description: formData.get("description")?.toString(),
      brand: formData.get("brand")?.toString(),
      sku: formData.get("sku")?.toString(),
      weight: num(formData.get("weight")),
      warrantyInformation: formData.get("warrantyInformation")?.toString(),
      shippingInformation: formData.get("shippingInformation")?.toString(),
      availabilityStatus: formData.get("availabilityStatus")?.toString(),
      returnPolicy: formData.get("returnPolicy")?.toString(),
      dimW: num(formData.get("dimensions.width")),
      dimH: num(formData.get("dimensions.height")),
      dimD: num(formData.get("dimensions.depth")),
      tags: formData.get("tags")?.toString(), // "a,b,c"
      image: formData.get("image")?.toString() || "",
    };

    // 2) Tip kontrol (NaN guard)
    if (!isNumber(raw.price) || raw.price < 0 || !isNumber(raw.stock) || raw.stock < 0) {
      return { success: false, message: "Invalid numeric values for price/stock." };
    }

    // 3) Zod validation (minimum alanlar)
    const parsed = updateSchema.safeParse({
      id: raw.id,
      title: raw.title,
      category: raw.category,
      price: raw.price,
      stock: raw.stock,
    });
    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        issues: zodIssues(parsed.error),
      };
    }

    // 4) Ürünü çek
    const ref = doc(db, collections.products, raw.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, message: "Product not found" };
    }
    const existing = { id: snap.id, ...snap.data() } as Product;

    // 5) Stripe fiyat güncellemesi (gerekirse)
    const oldPrice = Number(existing.price ?? 0);
    const newPrice = Number(raw.price);
    let stripePriceId: string | undefined = existing.stripePriceId;

    const priceChanged = oldPrice !== newPrice;
    const hasStripeProduct = Boolean(existing.stripeProductId);

    if (priceChanged && hasStripeProduct) {
      // Eski price'ı pasifleştir (varsa)
      if (existing.stripePriceId) {
        try {
          await stripe.prices.update(existing.stripePriceId, { active: false });
        } catch {
          // zaten inactive olabilir → ignore
        }
      }

      // Yeni price oluştur
      try {
        const currency = existing.stripeCurrency || process.env.STRIPE_CURRENCY || "usd";
        const created = await stripe.prices.create({
          product: existing.stripeProductId!,
          unit_amount: Math.round(newPrice * 100),
          currency,
        });
        stripePriceId = created.id;

        // Default price güncelle
        await stripe.products.update(existing.stripeProductId!, {
          default_price: stripePriceId,
        });
      } catch (e) {
        return { success: false, message: "Stripe price update failed." };
      }
    }

    // 6) Update payload (sadece tanımlı alanları ekle)
    const meta = typeof existing.meta === "object" && existing.meta ? existing.meta : {};
    const updatePayload: Record<string, unknown> = {
      title: raw.title,
      category: raw.category,
      price: newPrice,
      stock: raw.stock,
      meta: {
        ...meta,
        updatedAt: new Date().toISOString(), // string → serialize OK
      },
    };

    if (raw.description !== undefined) updatePayload.description = raw.description;
    if (raw.brand !== undefined) updatePayload.brand = raw.brand;
    if (raw.sku !== undefined) updatePayload.sku = raw.sku;
    if (isNumber(raw.weight)) updatePayload.weight = raw.weight;
    if (raw.warrantyInformation !== undefined) updatePayload.warrantyInformation = raw.warrantyInformation;
    if (raw.shippingInformation !== undefined) updatePayload.shippingInformation = raw.shippingInformation;
    if (raw.availabilityStatus !== undefined) updatePayload.availabilityStatus = raw.availabilityStatus;
    if (raw.returnPolicy !== undefined) updatePayload.returnPolicy = raw.returnPolicy;

    if (raw.dimW !== undefined || raw.dimH !== undefined || raw.dimD !== undefined) {
      const exDims = existing.dimensions ?? {};
      updatePayload.dimensions = {
        width: isNumber(raw.dimW) ? raw.dimW : Number(exDims.width ?? 0),
        height: isNumber(raw.dimH) ? raw.dimH : Number(exDims.height ?? 0),
        depth: isNumber(raw.dimD) ? raw.dimD : Number(exDims.depth ?? 0),
      };
    }

    if (raw.tags !== undefined) {
      const list = raw.tags
        ? raw.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [];
      updatePayload.tags = list;
    }

    if (raw.image) {
      updatePayload.images = [raw.image];
      updatePayload.thumbnail = raw.image;
    }

    if (stripePriceId) {
      updatePayload.stripePriceId = stripePriceId;
    }

    // 7) Firestore yaz (payload’ın serileştirilebilir olduğundan emin)
    // Not: JSON.parse/JSON.stringify → undefined’ları temizler.
    const serializablePayload = JSON.parse(JSON.stringify(updatePayload));
    await updateDoc(ref, serializablePayload);

    return { success: true, message: "Product updated successfully", stripePriceId };
  } catch (err) {
    // Buraya düşerse muhtemelen beklenmedik bir exception var
    console.error("updateProductAction error:", err);
    return { success: false, message: "Unexpected server error." };
  }
}
