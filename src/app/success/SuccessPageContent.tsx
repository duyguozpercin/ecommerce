'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { clearCart } = useCart(); // ✅ clearCart fonksiyonu alındı

  useEffect(() => {
    if (sessionId) {
      console.log("Kullanıcı, şu session ID ile başarı sayfasına ulaştı:", sessionId);
      clearCart(); // 🧹 Sepet temizleniyor
    }
  }, [sessionId, clearCart]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white p-6 text-center shadow-lg sm:p-8 lg:p-10">
        <svg
          className="mx-auto h-24 w-24 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Thank you for your order!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
          A confirmation email has been sent. You can view your order in your profile.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center rounded-md bg-slate-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
          >
            Continue Shopping
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center rounded-md bg-gray-200 px-6 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-300"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
