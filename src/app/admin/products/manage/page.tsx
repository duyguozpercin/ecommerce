'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { collection, getDocs } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import UpdateProduct from '@/app/admin/products/manage/update/page';
import DeleteProduct from '@/app/admin/products/manage/delete/page';
import { Pencil, Trash2 } from 'lucide-react';

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
    <main className="flex justify-center py-10 bg-[#F9F9F1] min-h-screen">
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

        <ProductTablePage
          products={products}
          onEdit={(p) => setEditProduct(p)}
        />

        {editProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
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
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-[#BABA8D] text-white">
            <th className="py-3 px-4 text-left">Title</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-left">Price</th>
            <th className="py-3 px-4 text-left">Stock</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="border px-4 py-2">{product.title}</td>
              <td className="border px-4 py-2">{product.category}</td>
              <td className="border px-4 py-2">${product.price}</td>
              <td className="border px-4 py-2">{product.stock}</td>
              <td className="border px-4 py-2 flex gap-2">
                <button onClick={() => onEdit(product)} title="Edit">
                  <Pencil className="w-5 h-5 text-blue-600 hover:text-blue-800" />
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
