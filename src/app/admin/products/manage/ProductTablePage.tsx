'use client';

import { Product } from '@/types/product';
import { Pencil } from 'lucide-react';
import DeleteProduct from '@/components/DeleteProduct';
import Image from 'next/image';

export default function ProductTablePage({
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
            <th className="py-2 px-2 md:py-3 md:px-4 text-center align-middle dark:text-black">Image</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-center align-middle dark:text-black">Title</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-center align-middle dark:text-black">Category</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-center align-middle dark:text-black">Price</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-center align-middle dark:text-black">Stock</th>
            <th className="py-2 px-2 md:py-3 md:px-4 text-center align-middle dark:text-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors align-top">
              <td className="border px-2 py-1 md:px-4 md:py-2 text-center align-middle">
                {product.images && product.images.length > 0 && product.images[0] ? (
                  <Image
                    width={50}
                    height={50}
                    src={product.images[0]}
                    alt={product.title}
                    className="object-cover rounded mx-auto"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center text-gray-500 mx-auto">
                    No image
                  </div>
                )}
              </td>
              <td className="border px-2 py-1 md:px-4 md:py-2 text-center align-middle dark:text-black">{product.title}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2 text-center align-middle dark:text-black">{product.category}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2 text-center align-middle dark:text-black">${product.price}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2 text-center align-middle dark:text-black">{product.stock}</td>
              <td className="border px-2 py-1 md:px-4 md:py-2 text-center align-middle dark:text-black">
                <div className="flex gap-2 items-center justify-center">
                  <button onClick={() => onEdit(product)} title="Edit">
                    <Pencil className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                  </button>
                  <DeleteProduct
                    productId={String(product.id)}
                    onDeleted={() => window.location.reload()}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
