import { Category } from '@/app/types/product';
import { newProductFormState } from '@/app/admin/products/new/page';
import { z } from 'zod';

const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum(Category),
});

export function addNewProduct (currentState: newProductFormState | null, formData: FormData) {

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,

  };

  productSchema.safeParse(rawData);

  console.log("Add new product action triggered");
}