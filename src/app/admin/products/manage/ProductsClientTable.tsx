'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import UpdateProduct from '@/components/UpdateProduct';
import ProductTablePage from '@/app/admin/products/manage/ProductTablePage';

export default function ProductsClientTable({ products }: { products: Product[] }) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  return (
    <>
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
    </>
  );
}


