'use client';
import { useState } from 'react';

interface DeleteProductProps {
  productId: string;
  onDeleted?: () => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export default function DeleteProduct({
  productId,
  onDeleted,
  activeId,
  setActiveId,
}: DeleteProductProps) {
  const isActive = activeId === productId;
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch('/api/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (data.success) {
        setActiveId(null);
        setShowSuccess(true);
        if (onDeleted) onDeleted();
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        console.error('🔥 Deletion failed:', data.message);
      }
    } catch (error) {
      console.error('🔥 Error deleting product or image', error);
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
          <p className="text-neutral-800 mb-4 text-sm">Are you sure you want to delete this product?</p>
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
    </div>
  );
}
