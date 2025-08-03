'use client';

import { Product } from '@/types/product';
import { Pencil, Trash2 } from 'lucide-react';
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
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Sol taraf: Resim + Başlık + Fiyat */}
          <div className="flex items-center gap-4">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={60}
                height={60}
                className="rounded-lg object-cover border border-gray-100"
              />
            ) : (
              <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <div>
              <p className="font-medium text-gray-800">{product.title}</p>
              <p className="text-sm text-gray-500">${product.price}</p>
            </div>
          </div>

          {/* Sağ taraf: Düzenle / Sil butonları */}
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(product)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="Edit"
            >
              <Pencil className="w-5 h-5 text-blue-600" />
            </button>

            <button
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="Delete"
            >
              <DeleteProduct
                productId={String(product.id)}
                onDeleted={() => window.location.reload()}
                activeId={activeId}
                setActiveId={setActiveId}
              />
            
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
