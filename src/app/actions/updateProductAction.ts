'use server';

import { doc, updateDoc } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(100),
  category: z.string(),
  price: z.number().min(0),
  stock: z.number().min(0),
});

export async function updateProductAction(formData: FormData) {
  const rawData = {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string, 10),
  };

  const result = productSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, message: 'Validation failed', errors: result.error.flatten().fieldErrors };
  }

  const docRef = doc(db, collections.products, rawData.id);
  await updateDoc(docRef, {
    title: rawData.title,
    category: rawData.category,
    price: rawData.price,
    stock: rawData.stock,
    meta: { updatedAt: Date.now() },
  });

  return { success: true, message: 'Product updated successfully' };
}
