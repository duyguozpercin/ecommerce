import { z } from "zod";
import { AvailabilityStatus, Category, returnPolicy } from "@/types/product";

export const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum(Category),
  price: z.number().min(0),
  stock: z.number().min(0),
  brand: z.string().min(1),
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  returnPolicy: z.nativeEnum(returnPolicy),
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
