"use server";

import { doc, setDoc } from "firebase/firestore";
import { put } from "@vercel/blob";
import { db, collections } from "@/utils/firebase";
import { stripe } from "@/utils/stripe";
import { z } from "zod";
import type { NewProductFormState } from "@/app/admin/products/new/page";
import type { Product, ProductForm } from "@/types/product";
import { AvailabilityStatus, ReturnPolicy } from "@/types/product";
import { Category } from "@/types/product";


const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum((Category as any)),
  price: z.number().min(0),
  stock: z.number().min(0),
  brand: z.string().min(1),
  availabilityStatus: z.nativeEnum((AvailabilityStatus as any)),
  returnPolicy: z.nativeEnum((ReturnPolicy as any)),
  tags: z.array(z.string()).min(1),
  sku: z.string().min(1).max(50),
  weight: z.number().min(1),
  warrantyInformation: z.string().min(1),
  shippingInformation: z.string().min(1),
  dimensions: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    depth: z.number().min(1),
  }),
});

export async function addNewProductAction(
  _currentState: NewProductFormState,
  formData: FormData
): Promise<NewProductFormState> {

  const raw: Partial<ProductForm> = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as Category,
    price: parseFloat(String(formData.get("price") || "0")),
    stock: parseInt(String(formData.get("stock") || "0"), 10),
    brand: formData.get("brand") as string,
    availabilityStatus: formData.get("availabilityStatus") as AvailabilityStatus,
    returnPolicy: formData.get("returnPolicy") as ReturnPolicy,
    sku: formData.get("sku") as string,
    weight: formData.get("weight") ? parseFloat(String(formData.get("weight"))) : undefined,
    warrantyInformation: formData.get("warrantyInformation") as string,
    shippingInformation: formData.get("shippingInformation") as string,
    dimensions: formData.get("dimensions.width")
      ? {
        width: parseFloat(String(formData.get("dimensions.width"))),
        height: parseFloat(String(formData.get("dimensions.height"))),
        depth: parseFloat(String(formData.get("dimensions.depth"))),
      }
      : undefined,
    tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()) || [],
  };


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
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      imageUrl = blob.url;
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        success: false,
        message: "Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        inputs: raw as any
      };
    }
  }

  try {

    const stripeProduct = await stripe.products.create({
      name: data.title,
      description: data.description,
      metadata: { appProductId: id, brand: data.brand ?? "", sku: data.sku ?? "" },
    });
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const price = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(Number(data.price) * 100),
      currency,
    });
    await stripe.products.update(stripeProduct.id, { default_price: price.id });


    const finalData: Product = {
      id,
      category: data.category,
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
      brand: data.brand,
      availabilityStatus: data.availabilityStatus,
      returnPolicy: data.returnPolicy,
      sku: data.sku,
      weight: data.weight,
      warrantyInformation: data.warrantyInformation,
      shippingInformation: data.shippingInformation,
      dimensions: data.dimensions,
      tags: data.tags,

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

    return { success: true, message: "Ürün başarıyla oluşturuldu!", data: finalData };
  } catch (err) {
    console.error("Create product error:", err);
    return { success: false, message: "Ürün eklenirken bir hata oluştu.", inputs: raw as any };
  }
}
