import { z } from "zod";
import { AvailabilityStatus, Category, ReturnPolicy } from "@/types/product";

export const productSchema = z.object({
  // Zorunlu Alanlar
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100),
  category: z.nativeEnum(Category),
  price: z.number({ invalid_type_error: "Price must be a number." }).min(0),
  stock: z.number({ invalid_type_error: "Stock must be a number." }).min(0),
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  returnPolicy: z.nativeEnum(ReturnPolicy),
  dimensions: z.object({
    width: z.number({ invalid_type_error: "Width must be a number." }).min(0.1),
    height: z.number({ invalid_type_error: "Height must be a number." }).min(0.1),
    depth: z.number({ invalid_type_error: "Depth must be a number." }).min(0.1),
  }),
  
  // İsteğe Bağlı (Opsiyonel) Alanlar
  description: z.string().min(10, "Description must be at least 10 characters long.").max(500).optional(),
  brand: z.string().min(1).optional(),
  tags: z.array(z.string()).min(1, "At least one tag must be selected.").optional(),
  sku: z.string().min(1).max(50).optional(),
  weight: z.number({ invalid_type_error: "Weight must be a number." }).min(0.1).optional(),
  warrantyInformation: z.string().min(1).optional(),
  shippingInformation: z.string().min(1).optional(),
});