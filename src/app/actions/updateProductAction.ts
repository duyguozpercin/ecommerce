'use server';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import { z } from "zod";
import type { Product } from "@/types/product";

const num = (v: FormDataEntryValue | null) =>
  v == null || v === "" ? undefined : Number(v);

const isNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

const zodIssues = (err: z.ZodError): { path: string; message: string }[] =>
  err.issues.map(i => ({
    path: i.path.join("."),
    message: i.message,
  }));


const dimensionsSchema = z.object({
  width: z.number().min(0),
  height: z.number().min(0),
  depth: z.number().min(0),
}).partial();

const updateSchema = z.object({
  id: z.string().min(1, "Missing product id"),
  title: z.string().min(3).max(100),
  category: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),

  
  dimensions: dimensionsSchema.optional(),

  
  description: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  weight: z.number().optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  availabilityStatus: z.string().optional(),
  returnPolicy: z.string().optional(),
  tags: z.string().optional(),
  image: z.string().optional(), 
});

type ActionOk = { success: true; message: string; stripePriceId?: string };
type ActionErr = {
  success: false;
  message: string;
  issues?: { path: string; message: string }[];
};
type ActionResult = ActionOk | ActionErr;

export async function updateProductAction(formData: FormData): Promise<ActionResult> {
  try {
    
    const raw = {
      id: String(formData.get("id") || ""),
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      price: num(formData.get("price")),
      stock: num(formData.get("stock")),

      description: formData.get("description")?.toString(),
      brand: formData.get("brand")?.toString(),
      sku: formData.get("sku")?.toString(),
      weight: num(formData.get("weight")),
      warrantyInformation: formData.get("warrantyInformation")?.toString(),
      shippingInformation: formData.get("shippingInformation")?.toString(),
      availabilityStatus: formData.get("availabilityStatus")?.toString(),
      returnPolicy: formData.get("returnPolicy")?.toString(),

      dimensions: {
        width:  num(formData.get("dimensions.width")),
        height: num(formData.get("dimensions.height")),
        depth:  num(formData.get("dimensions.depth")),
      },

      tags: formData.get("tags")?.toString(),
      image: formData.get("image")?.toString() || "",
    };

    
    if (!isNumber(raw.price) || raw.price < 0 || !isNumber(raw.stock) || raw.stock < 0) {
      return { success: false, message: "Invalid numeric values for price/stock." };
    }

    
    const hasAnyDim =
      isNumber(raw.dimensions.width) ||
      isNumber(raw.dimensions.height) ||
      isNumber(raw.dimensions.depth);

    const parsed = updateSchema.safeParse({
      id: raw.id,
      title: raw.title,
      category: raw.category,
      price: raw.price,
      stock: raw.stock,

      description: raw.description,
      brand: raw.brand,
      sku: raw.sku,
      weight: raw.weight,
      warrantyInformation: raw.warrantyInformation,
      shippingInformation: raw.shippingInformation,
      availabilityStatus: raw.availabilityStatus,
      returnPolicy: raw.returnPolicy,

      ...(hasAnyDim ? {
        dimensions: {
          ...(isNumber(raw.dimensions.width)  ? { width:  raw.dimensions.width }  : {}),
          ...(isNumber(raw.dimensions.height) ? { height: raw.dimensions.height } : {}),
          ...(isNumber(raw.dimensions.depth)  ? { depth:  raw.dimensions.depth }  : {}),
        }
      } : {}),

      tags: raw.tags,
      image: raw.image,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        issues: zodIssues(parsed.error),
      };
    }

    
    const ref = doc(db, collections.products, raw.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { success: false, message: "Product not found" };
    }
    const existing = { id: snap.id, ...snap.data() } as Product;

    
    const oldPrice = Number(existing.price ?? 0);
    const newPrice = Number(raw.price);
    let stripePriceId: string | undefined = existing.stripePriceId;

    const priceChanged = oldPrice !== newPrice;
    const hasStripeProduct = Boolean(existing.stripeProductId);

    if (priceChanged && hasStripeProduct) {
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

        await stripe.products.update(existing.stripeProductId!, {
          default_price: stripePriceId,
        });
      } catch {
        return { success: false, message: "Stripe price update failed." };
      }
    }

    
    const meta = typeof existing.meta === "object" && existing.meta ? existing.meta : {};
    const updatePayload: Record<string, unknown> = {
      title: parsed.data.title,
      category: parsed.data.category,
      price: newPrice,
      stock: parsed.data.stock,
      meta: {
        ...meta,
        updatedAt: new Date().toISOString(), 
      },
    };

    
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
    if (parsed.data.brand !== undefined) updatePayload.brand = parsed.data.brand;
    if (parsed.data.sku !== undefined) updatePayload.sku = parsed.data.sku;
    if (isNumber(parsed.data.weight)) updatePayload.weight = parsed.data.weight;
    if (parsed.data.warrantyInformation !== undefined) updatePayload.warrantyInformation = parsed.data.warrantyInformation;
    if (parsed.data.shippingInformation !== undefined) updatePayload.shippingInformation = parsed.data.shippingInformation;
    if (parsed.data.availabilityStatus !== undefined) updatePayload.availabilityStatus = parsed.data.availabilityStatus;
    if (parsed.data.returnPolicy !== undefined) updatePayload.returnPolicy = parsed.data.returnPolicy;

    
    if (parsed.data.dimensions && Object.keys(parsed.data.dimensions).length > 0) {
      const exDims = (existing.dimensions ?? {}) as Partial<{ width:number; height:number; depth:number }>;
      const nextDims = {
        width:  isNumber(parsed.data.dimensions.width)  ? parsed.data.dimensions.width  : exDims.width,
        height: isNumber(parsed.data.dimensions.height) ? parsed.data.dimensions.height : exDims.height,
        depth:  isNumber(parsed.data.dimensions.depth)  ? parsed.data.dimensions.depth  : exDims.depth,
      };
      const hasAny =
        isNumber(nextDims.width) || isNumber(nextDims.height) || isNumber(nextDims.depth);
      if (hasAny) updatePayload.dimensions = nextDims;
    }

    
    if (parsed.data.tags !== undefined) {
      const list = parsed.data.tags
        ? parsed.data.tags.split(",").map(t => t.trim()).filter(Boolean)
        : [];
      updatePayload.tags = list;
    }

    
    if (parsed.data.image) {
      updatePayload.images = [parsed.data.image];
      updatePayload.thumbnail = parsed.data.image;
    }

    if (stripePriceId) updatePayload.stripePriceId = stripePriceId;

    
    const serializablePayload = JSON.parse(JSON.stringify(updatePayload));
    await updateDoc(ref, serializablePayload);

    return { success: true, message: "Product updated successfully", stripePriceId };
  } catch (err) {
    console.error("updateProductAction error:", err);
    return { success: false, message: "Unexpected server error." };
  }
}
