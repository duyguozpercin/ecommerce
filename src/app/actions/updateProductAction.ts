"use server";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import { z } from "zod";
import type { Product } from "@/types/product";

// Yalın bir validasyon: update için minimum alanlar
const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(100),
  category: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
});

// Helper – number parse
const num = (v: FormDataEntryValue | null) =>
  v == null || v === "" ? undefined : Number(v);

export async function updateProductAction(formData: FormData) {
  // 1) Form verilerini al
  const raw = {
    id: String(formData.get("id") || ""),
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || ""),
    price: Number(formData.get("price") || 0),
    stock: Number(formData.get("stock") || 0),

    // opsiyoneller
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
    image: formData.get("image")?.toString() || "", // client upload sonrası gelen URL
  };

  // 2) Minimum validasyon
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
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3) Mevcut ürünü çek
  const ref = doc(db, collections.products, raw.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { success: false, message: "Product not found" };
  }
  const existing = { id: snap.id, ...snap.data() } as Product;

  // 4) Fiyat değişti mi?
  const oldPrice = Number(existing.price);
  const newPrice = Number(raw.price);
  const priceChanged = oldPrice !== newPrice;

  let stripePriceId = existing.stripePriceId;

  if (priceChanged && existing.stripeProductId) {
    // Eski price'ı pasifleştir
    if (existing.stripePriceId) {
      try {
        await stripe.prices.update(existing.stripePriceId, { active: false });
      } catch {
        // zaten inactive olabilir, sorun değil
      }
    }

    // Yeni price oluştur
    const currency = existing.stripeCurrency || process.env.STRIPE_CURRENCY || "usd";
    const created = await stripe.prices.create({
      product: existing.stripeProductId,
      unit_amount: Math.round(newPrice * 100),
      currency,
    });

    stripePriceId = created.id;

    // Ürünün default_price'ını güncelle
    await stripe.products.update(existing.stripeProductId, {
      default_price: stripePriceId,
    });
  }

  // 5) Firestore update payload
  const nowIso = new Date().toISOString();

  const updatePayload: any = {
    title: raw.title,
    category: raw.category,
    price: newPrice,
    stock: raw.stock,
    meta: {
      ...(existing.meta ?? {}),
      updatedAt: nowIso,
    },
  };

  if (raw.description !== undefined) updatePayload.description = raw.description;
  if (raw.brand !== undefined) updatePayload.brand = raw.brand;
  if (raw.sku !== undefined) updatePayload.sku = raw.sku;
  if (raw.weight !== undefined) updatePayload.weight = raw.weight;
  if (raw.warrantyInformation !== undefined) updatePayload.warrantyInformation = raw.warrantyInformation;
  if (raw.shippingInformation !== undefined) updatePayload.shippingInformation = raw.shippingInformation;
  if (raw.availabilityStatus !== undefined) updatePayload.availabilityStatus = raw.availabilityStatus;
  if (raw.returnPolicy !== undefined) updatePayload.returnPolicy = raw.returnPolicy;

  // Dimensions objesini sadece herhangi biri gelmişse güncelle
  if (raw.dimW !== undefined || raw.dimH !== undefined || raw.dimD !== undefined) {
    updatePayload.dimensions = {
      width: raw.dimW ?? existing.dimensions?.width ?? 0,
      height: raw.dimH ?? existing.dimensions?.height ?? 0,
      depth: raw.dimD ?? existing.dimensions?.depth ?? 0,
    };
  }

  if (raw.tags !== undefined) {
    updatePayload.tags = raw.tags ? raw.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  }

  if (raw.image) {
    updatePayload.images = [raw.image];
    updatePayload.thumbnail = raw.image;
  }

  if (stripePriceId) {
    updatePayload.stripePriceId = stripePriceId;
  }

  // 6) Firestore'a yaz
  await updateDoc(ref, updatePayload);

  return { success: true, message: "Product updated successfully", stripePriceId };
}
