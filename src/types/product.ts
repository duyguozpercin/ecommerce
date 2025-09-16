import { z } from 'zod';
import { productSchema } from '@/app/schemas/productSchema';


export type ProductForm = z.infer<typeof productSchema>;


export interface Product {
  id: number | string;
  title: string;
  description?: string;
  category: Category;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: Dimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: AvailabilityStatus;
  reviews?: Review[];
  returnPolicy?: ReturnPolicy;
  minimumOrderQuantity?: number;
  meta?: Meta;
  images?: string[];
  thumbnail?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  stripeCurrency?: string;
}

export enum Category {
  decoration = 'Decoration',
  chairs = 'Chairs',
  sofas = 'Sofas',
  tables = 'Tables',
}

export const allCategories = Object.values(Category);

export enum AvailabilityStatus {
  IN_STOCK = 'In Stock',
  OUT_OF_STOCK = 'Out of Stock',
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export enum ReturnPolicy {
  NO_RETURN_POLICY = 'No Return Policy',
  DAYS_7 = '7 days return policy',
  DAYS_14 = '14 days return policy',
  DAYS_30 = '30 days return policy',
  DAYS_60 = '60 days return policy',
  DAYS_90 = '90 days return policy',
}

export interface Meta {
  createdAt: string;
  updatedAt: string;
  barcode?: string;
  qrCode?: string;
}