'use client';

import { Product } from '@/types/product';
import { Pencil } from 'lucide-react';
import DeleteProduct from '@/components/DeleteProduct';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductTablePage({
  products,
  onEdit,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl w-full px-4">
      
      <div className="space-y-4 sm:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow gap-3"
          >
            
            <div className="mx-auto">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover border border-gray-100"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            
            <div className="text-center">
              <p className="font-medium text-gray-800">{product.title}</p>
              <p className="text-sm text-gray-500">${product.price}</p>
            </div>

          
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onEdit(product)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="Edit"
              >
                <Pencil className="w-5 h-5 text-blue-600" />
              </button>

              <DeleteProduct
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="Delete"
                productId={String(product.id)}
                onDeleted={() => window.location.reload()}
                activeId={activeId}
                setActiveId={setActiveId}
              />
            </div>
          </div>
        ))}
      </div>

      
      <div className="hidden sm:table w-full border border-gray-200 rounded-lg shadow bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600 text-sm">
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Price</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                
                <td className="p-3">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  )}
                </td>

                
                <td className="p-3 font-medium text-gray-800">{product.title}</td>

                
                <td className="p-3 text-gray-600">${product.price}</td>

                
                <td className="p-3 text-right">
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </button>

                    <DeleteProduct
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Delete"
                      productId={String(product.id)}
                      onDeleted={() => window.location.reload()}
                      activeId={activeId}
                      setActiveId={setActiveId}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
