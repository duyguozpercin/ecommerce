'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { collection, getDocs } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import UpdateProduct from '@/app/admin/products/manage/update/page';
import DeleteProduct from '@/app/admin/products/manage/delete/page';
import { Pencil} from 'lucide-react';
export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, collections.products));
      const productsData: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        const productData = docSnap.data() as Omit<Product, 'id'>;
        productsData.push({ id: docSnap.id, ...productData });
      });
      setProducts(productsData);
    };
    fetchProducts();
  }, []);
  return (
    <main className="flex justify-center py-10 bg-[#f5f5f5] min-h-screen relative">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product List</h1>
          <a
            href="/admin/products/new"
            className="bg-[#BABA8D] text-white px-4 py-2 rounded-lg hover:bg-[#A4A489] transition-colors"
          >
            Add New Product
          </a>
        </div>
        
        <div className={editProduct ? 'blur-sm pointer-events-none' : ''}>
          <ProductTablePage
            products={products}
            onEdit={(p) => setEditProduct(p)}
          />
        </div>
        {editProduct && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white p-6 rounded shadow max-w-md w-full z-20 border border-gray-300">
            <UpdateProduct
              product={editProduct}
              onUpdated={() => {
                setEditProduct(null);
                window.location.reload();
              }}
            />
            <button
              onClick={() => setEditProduct(null)}
              className="mt-2 text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
function ProductTablePage({
  products,
  onEdit,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
}) {
  return (
    <div className="overflow-x-auto min-h-[500px]"> 
      <table className="w-full md:min-w-full border border-gray-300 text-sm md:text-base">
        <thead>
          <tr className="bg-[#BABA8D] text-white">
            <th className="py-2 px-2 md:py-3 md:px-4 text-left">Title</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-left">Category</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-left">Price</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-left">Stock</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="border px-2 py-1 md:px-4 md:py-2">{product.title}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2">{product.category}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2">${product.price}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2">{product.stock}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2 flex gap-2">
                <button onClick={() => onEdit(product)} title="Edit">
                  <Pencil className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                </button>
                <DeleteProduct
                  productId={String(product.id)}
                  onDeleted={() => window.location.reload()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}