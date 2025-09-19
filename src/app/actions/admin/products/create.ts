"use server";

import { doc, setDoc } from "firebase/firestore";
import { put } from "@vercel/blob";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import { NewProductFormState } from "@/components/admin/products/ProductForm";
import type { Product } from "@/types/product";
import { productSchema, formDataToRawProduct } from "./schema";
import { redirect } from "next/navigation"; // ✅ eklendi

export async function addNewProductAction(
  _currentState: NewProductFormState,
  formData: FormData
): Promise<NewProductFormState> {
  const raw = formDataToRawProduct(formData);
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Lütfen form girdilerini düzeltin.",
      inputs: raw as any,
      errors: parsed.error.flatten().fieldErrors as any,
    };
  }

  const data = parsed.data;
  const id = Date.now().toString();

  // ✅ Image upload
  let imageUrl = "";
  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    const MAX = 4.5 * 1024 * 1024;
    const okTypes = ["image/jpeg", "image/jpg", "image/webp", "image/png"];
    if (!okTypes.includes(image.type)) {
      return { success: false, message: "İzin verilen resim formatları: .jpeg, .jpg, .webp, .png" };
    }
    if (image.size > MAX) {
      return { success: false, message: "Maksimum resim boyutu 4.5 MB olabilir." };
    }
    const imageName = `${id}.${image.name.split(".").pop()}`;
    try {
      const blob = await put(imageName, image, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      imageUrl = blob.url;
    } catch (error) {
      console.error("Image upload error:", error);
      return { success: false, message: "Resim yüklenirken bir hata oluştu.", inputs: raw as any };
    }
  }

  try {
    // ✅ Stripe create
    const stripeProduct = await stripe.products.create({
      name: data.title!,
      description: data.description!,
      metadata: { appProductId: id, brand: data.brand ?? "", sku: data.sku ?? "" },
    });
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const price = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(Number(data.price) * 100),
      currency,
    });
    await stripe.products.update(stripeProduct.id, { default_price: price.id });

    // ✅ Firestore save
    const finalData: Product = {
      id,
      category: data.category!,
      title: data.title!,
      description: data.description!,
      price: data.price!,
      stock: data.stock!,
      brand: data.brand!,
      availabilityStatus: data.availabilityStatus!,
      returnPolicy: data.returnPolicy!,
      sku: data.sku!,
      weight: data.weight,
      warrantyInformation: data.warrantyInformation!,
      shippingInformation: data.shippingInformation!,
      dimensions: data.dimensions,
      tags: data.tags || [],
      discountPercentage: 0,
      rating: 0,
      reviews: [],
      images: imageUrl ? [imageUrl] : [],
      thumbnail: imageUrl || "",
      minimumOrderQuantity: 1,
      meta: {
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
      },
      stripeProductId: stripeProduct.id,
      stripePriceId: price.id,
      stripeCurrency: currency,
    };

    await setDoc(doc(db, collections.products, id), finalData);

    // ✅ Başarılı olunca yönlendirme
    redirect("/admin/products/manage");
  } catch (err) {
    console.error("Create product error:", err);
    return { success: false, message: "Ürün eklenirken bir hata oluştu.", inputs: raw as any };
  }
}
