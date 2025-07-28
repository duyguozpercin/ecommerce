export interface Product {
  id:  number | string;
  title: string;
  description: string;
  category: string; 
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: Dimensions;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: AvailabilityStatus;
  reviews?: Review[];
  returnPolicy: returnPolicy;
  minimumOrderQuantity: number;
  meta: Meta;
  images: string[];
  thumbnail: string;
}

export interface ProductForm {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  availabilityStatus: AvailabilityStatus;
  brand: string;
  returnPolicy: returnPolicy;
  sku: string;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  tags: string[];
}


export enum Category {
  decoration = 'Decoration',
  chair = 'Chair',
  sofa = 'Sofa',
  table = 'Table',
  
}

export const allCategories = Object.values(Category);


export enum AvailabilityStatus {
  IN_STOCK = 'In Stock',
  OUT_OF_STOCK = 'Out of Stock',
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export enum returnPolicy {
  NO_RETURN_POLICY = 'No Return Policy',
  DAYS_14 = '14 days return policy',
  DAYS_7 = '7 days return policy',
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

