'use client';

import { useState } from 'react';
import { deleteProductAction } from '@/app/actions/admin/products/deleteProductAction';

interface DeleteProductProps {
  productId: string;
  onDeleted?: () => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  className?: string;
  title?: string;
}

export default function DeleteProduct({
  productId,
  onDeleted,
  activeId,
  setActiveId,
}: DeleteProductProps) {
  const isActive = activeId === productId;
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      const result = await deleteProductAction(productId);

      if (result.success) {
        setActiveId(null);
        setShowSuccess(true);
        setErrorMessage(null);
        if (onDeleted) onDeleted();
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('🔥 Error deleting product or image', error);
      setErrorMessage('Unexpected error occurred.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setActiveId(productId)}
        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
      >
        x
      </button>

      {isActive && (
        <div className="absolute top-12 right-0 bg-white border border-gray-300 shadow-lg p-4 rounded w-64 z-10">
          <p className="text-neutral-800 mb-4 text-sm">
            Are you sure you want to delete this product?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Yes
            </button>
            <button
              onClick={() => setActiveId(null)}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="absolute top-12 right-0 bg-green-100 border border-green-300 shadow p-2 rounded w-64 text-center z-10">
          <p className="text-green-700 text-sm">Product deleted successfully!</p>
        </div>
      )}

      {errorMessage && (
        <div className="absolute top-12 right-0 bg-red-100 border border-red-300 shadow p-2 rounded w-64 text-center z-10">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
