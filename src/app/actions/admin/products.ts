import { NewProductFormState } from '@/app/admin/products/new/page';
import { Category } from '@/types/product';
import { z } from 'zod';


export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(50, "Description must be at least 50 characters").max(500),
  category: z.nativeEnum(Category),
  price: z.number().min(0, "Price cannot be negative"),
  stock: z.number().min(0, "Stock cannot be negative"),
});

export async function addNewProductAction(
  currentState: NewProductFormState,
  formData: FormData
): Promise<NewProductFormState> {

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
  };

  const result = productSchema.safeParse(rawData);

  if (!result.success) {
    console.log(result);
    return {
      success: false,
      message: 'Please correct the form input',
      inputs: { ...rawData },
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

  
}