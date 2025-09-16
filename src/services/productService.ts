import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, collections } from "@/utils/firebase";
import { Product } from "@/types/product";

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, collections.products), orderBy("title", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw new Error("Failed to fetch products. Please try again later.");
  }
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  try {
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
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    throw new Error("Failed to fetch products by IDs. Please try again later.");
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, collections.products, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error("Failed to fetch product. Please try again later.");
  }
};

export const saveProduct = async (product: Product) => {
  try {
    const docRef = doc(db, collections.products, String(product.id));
    await setDoc(docRef, product);
  } catch (error) {
    console.error("Error saving product:", error);
    throw new Error("Failed to save product. Please try again later.");
  }
};

export const decreaseProductStock = async (productId: string) => {
  try {
    const docRef = doc(db, collections.products, productId);
    await updateDoc(docRef, {
      stock: increment(-1),
    });
  } catch (error) {
    console.error(`Error decreasing stock for product ${productId}:`, error);
    throw new Error("Failed to decrease product stock. Please try again later.");
  }
};
