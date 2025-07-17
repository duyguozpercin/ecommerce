'use client';
import { useState } from 'react';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import { del } from '@vercel/blob'; // 👈 Bunu ekleyeceğiz

interface DeleteProductProps {
  productId: string;
  onDeleted?: () => void;
}

export default function DeleteProduct({ productId, onDeleted }: DeleteProductProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      // Ürün verilerini çek
      const productRef = doc(db, collections.products, productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();

        // Üründe images alanı varsa ve URL içeriyorsa
        if (productData.images && productData.images.length > 0) {
          for (const imageUrl of productData.images) {
            await del(imageUrl); // Vercel Blob'dan sil
          }
        }
      }

      // Firestore'dan sil
      await deleteDoc(productRef);

      setShowConfirm(false);
      setShowSuccess(true);
      if (onDeleted) onDeleted();
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("🔥 Error deleting product or image", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
      >
        x
      </button>

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

      {showSuccess && (
        <div className="absolute top-12 right-0 bg-green-100 border border-green-300 shadow p-2 rounded w-64 text-center z-10">
          <p className="text-green-700 text-sm">Product deleted successfully!</p>
        </div>
      )}
    </div>
  );
}
