// Removed circular import of Category
import { newProductFormState } from '@/app/admin/products/new/page';
import { z } from 'zod';

export enum Category {
  fragrance = 'fragrance',
  beauty = 'beauty',
  groceiries = 'groceries',
}

const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum(Category),
});

export function addNewProductAction(currentState: newProductFormState | null, formData: FormData) {

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,

  };

 const result = productSchema.safeParse(rawData);

  if (!result.success) {
    console.log(result)
    return {
      success: false,
      message: 'Please correct the form input',
      inputs: {...rawData},
      errors: result.error.flatten().fieldErrors
    }
  } else {
    console.log(result);
    return {
      success: true,
      message: 'The product is created successfully',
    }
  }
  console.log("Add new product action triggered");
}