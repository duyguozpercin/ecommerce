import { NewProductFormState } from '@/app/admin/products/new/page';
import { Category } from '@/types/product';
import { z } from 'zod';

const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  category: z.nativeEnum(Category),
});

export async function addNewProductAction(
  currentState: NewProductFormState,
  formData: FormData
): Promise<NewProductFormState> {
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
  };

  const result = productSchema.safeParse(rawData);

  if (!result.success) {
    console.log(result);
    return {
      success: false,
      message: 'Please correct the form input',
      inputs: {...rawData},
      errors: result.error.flatten().fieldErrors
    }
  } else {
    console.log(result);
    // TODO: Send data to Firebase
    return {
      success: true,
      message: 'The product is created successfully',
    }
  }

  console.log('Adding a new product...');
}