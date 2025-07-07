import { NewProductFormState } from '@/app/admin/products/new/page';
import { Category } from '@/types/product';
import { z } from 'zod';
import { db, collections } from '@/utils/firebase';
import { doc, setDoc } from "firebase/firestore";

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
  // ✅ Adım 1: Ham form verisini logla
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
  };

  console.log('🔎 rawData:', rawData);

  // ✅ Adım 2: Zod ile parse sonucu
  const result = productSchema.safeParse(rawData);
  console.log('✅ Zod parse result:', result);

  if (!result.success) {
    console.error('❌ Failed parsing form data', result.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Please correct the form input',
      inputs: { ...rawData },
      errors: result.error.flatten().fieldErrors,
    };
  }

  const id = Date.now().toString();
  const dateNow = Date.now();

  console.log('🆔 Generated ID:', id);
  console.log('📅 Timestamps:', dateNow);

  try {
    console.log('💾 Trying to write to Firestore...');

    await setDoc(doc(db, collections.products, id), {
      title: result.data.title,
      description: result.data.description,
      category: result.data.category,
      price: result.data.price,
      stock: result.data.stock,
      meta: {
        createdAt: dateNow,
        updatedAt: dateNow,
        barcode: '',
        qrCode: '',
      },
    });

    console.log('✅ Firestore write successful!');

    return {
      success: true,
      message: 'The product is created successfully',
      data: { id, ...result.data },
    };
  } catch (err) {
    console.error('🔥 Error adding a new product to Firebase', err);
    console.error(err); // <-- 🔥 ASIL DETAY BURADA
    return {
      success: false,
      message: 'Failed creating a new product in the database',
      inputs: { ...rawData },
    };
  }
}
