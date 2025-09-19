import { z } from "zod";
import type { ProductForm } from "@/types/product";
import { AvailabilityStatus, ReturnPolicy, Category } from "@/types/product";

//
// Tek Schema (create + update için ortak)
//
export const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum(Category as any),
  price: z.number().min(0),
  stock: z.number().min(0),
  brand: z.string().min(1),
  availabilityStatus: z.nativeEnum(AvailabilityStatus as any),
  returnPolicy: z.nativeEnum(ReturnPolicy as any),
  tags: z.array(z.string()).min(1).optional(),
  sku: z.string().min(1).max(50),
  weight: z.number().min(1).optional(),
  warrantyInformation: z.string().min(1).optional(),
  shippingInformation: z.string().min(1).optional(),
  dimensions: z
    .object({
      width: z.number().min(1),
      height: z.number().min(1),
      depth: z.number().min(1),
    })
    .optional(),
  image: z.string().url().optional(),
});

//
// Ortak helper fonksiyon
//
export type ProductFormInput = Partial<ProductForm> & {
  id?: string;
  image?: string;
};

export function formDataToRawProduct(formData: FormData): ProductFormInput {
  return {
    id: formData.get("id")?.toString(),
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    category: formData.get("category") as Category,
    price: formData.get("price") ? parseFloat(String(formData.get("price"))) : undefined,
    stock: formData.get("stock") ? parseInt(String(formData.get("stock")), 10) : undefined,
    brand: formData.get("brand")?.toString(),
    availabilityStatus: formData.get("availabilityStatus") as AvailabilityStatus,
    returnPolicy: formData.get("returnPolicy") as ReturnPolicy,
    sku: formData.get("sku")?.toString(),
    weight: formData.get("weight") ? parseFloat(String(formData.get("weight"))) : undefined,
    warrantyInformation: formData.get("warrantyInformation")?.toString(),
    shippingInformation: formData.get("shippingInformation")?.toString(),
    dimensions: formData.get("dimensions.width")
      ? {
          width: parseFloat(String(formData.get("dimensions.width"))),
          height: parseFloat(String(formData.get("dimensions.height"))),
          depth: parseFloat(String(formData.get("dimensions.depth"))),
        }
      : undefined,
    tags:
      (formData.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) || [],
    image: formData.get("image")?.toString(),
  };
}
