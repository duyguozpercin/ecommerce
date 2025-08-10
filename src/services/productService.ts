import { collection, getDocs, getDoc, doc, query, orderBy, setDoc } from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { Product } from "@/types/product";

export const getAllProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, collections.products), orderBy("title", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  const promises = ids.map(async id => {
    const docRef = doc(db, collections.products, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  });

  const results = await Promise.all(promises);
  return results.filter((product): product is Product => product !== null);
};

export const saveProduct = async (product: Product) => {
  const docRef = doc(db, collections.products, String(product.id));
  await setDoc(docRef, product);
};
