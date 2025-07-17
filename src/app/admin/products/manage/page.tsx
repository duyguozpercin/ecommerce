import { Product } from '@/types/product';
import { collection, getDocs } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import ProductsClientTable from './ProductsClientTable';

export default async function ManageProductsPage() {
  const querySnapshot = await getDocs(collection(db, collections.products));
  const productsData: Product[] = [];
  querySnapshot.forEach((docSnap) => {
    const productData = docSnap.data() as Omit<Product, 'id'>;
    productsData.push({ id: docSnap.id, ...productData });
  });

  console.log("🔥 ProductsData:", productsData);

  return (
    <main className="flex justify-center py-10 bg-[#f5f5f5] min-h-screen relative">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-black">Product List</h1>
          <a
            href="/admin/products/new"
            className="bg-[#BABA8D] text-white px-4 py-2 rounded-lg hover:bg-[#A4A489] transition-colors"
          >
            Add New Product
          </a>
        </div>
        <ProductsClientTable products={productsData} />
      </div>
    </main>
  );
}
