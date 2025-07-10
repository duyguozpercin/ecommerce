'use client';
import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';

interface DeleteProductProps {
  productId: string;
  onDeleted?: () => void;
}

export default function DeleteProduct({ productId, onDeleted }: DeleteProductProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    await deleteDoc(doc(db, collections.products, productId));
    setShowConfirm(false);
    setShowSuccess(true);
    if (onDeleted) onDeleted();
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
      >
        X
      </button>

      {/* Inline Confirm Box */}
      {showConfirm && (
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
              onClick={() => setShowConfirm(false)}
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inline Success Box */}
      {showSuccess && (
        <div className="absolute top-12 right-0 bg-green-100 border border-green-300 shadow p-2 rounded w-64 text-center z-10">
          <p className="text-green-700 text-sm">Product deleted successfully!</p>
        </div>
      )}
    </div>
  );
}