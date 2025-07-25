// src/services/categoryService.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export async function getAllCategoriesFromProducts(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, "products"));
  const categorySet = new Set<string>();

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.category) {
      categorySet.add(data.category); // 🔥 doğrudan product içindeki category
    }
  });

  return Array.from(categorySet);
}
