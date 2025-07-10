'use client';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';

interface DeleteProductProps {
  productId: string;
  onDeleted?: () => void;
}

export default function DeleteProduct({ productId, onDeleted }: DeleteProductProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    await deleteDoc(doc(db, collections.products, productId));
    if (onDeleted) onDeleted();
    alert('Product deleted successfully!');
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
  );
}
