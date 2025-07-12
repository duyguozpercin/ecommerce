'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { doc, getDoc } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import UpdateProduct from '@/app/admin/products/manage/update/page';
import DeleteProduct from '@/app/admin/products/manage/delete/page';
import { Pencil, Trash2 } from 'lucide-react';


export const SuccessPage = ({ product }: { product?: Partial<Product> }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  useEffect(() => {
    const fetchProductData = async () => {
      if (!product?.id) return;
      const docRef = doc(db, collections.products, String(product.id));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        const { id: _, ...restData } = data; 
        setProducts([{ id: String(product.id), ...restData }]);
      } else {
        console.log("No such document!");
      }
    };
    fetchProductData();
  }, [product?.id]);
  if (!product) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">The product was added successfully</h1>
      </div>
    );
  }
  return (
    <>
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold dark:text-stone-900">The product was added successfully</h1>
        <p className='dark:text-stone-900'>ID: {product.id}</p>
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
    </>
  );
};
function ProductTablePage({
  products,
  onEdit,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
}) {
  return (
    <main className="flex justify-center py-10 bg-[#F9F9F1] min-h-screen">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-neutral-800">Product List</h1>
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
                      <Pencil className="w-5 h-5 text-black-600 hover:text-blue-800" />
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
      </div>
    </main>
  );
}

