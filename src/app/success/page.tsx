'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { decreaseProductStock, getProductById } from '@/services/productService';
import { addUserOrder } from '@/services/orderService';
import { sendOrderConfirmation } from '@/app/actions/email/sendOrderConfirmation';
import { useEffect, useState } from 'react';
import { getSession } from '@/app/actions/stripe/getSessions';

export default function Success() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id');
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    const handleSuccess = async () => {
      if (!session_id) return;

      try {
        const { productId, amount, paymentId } = await getSession(session_id);

        if (productId) {
          await decreaseProductStock(productId);
        }

        if (user && productId && paymentId) {
          await addUserOrder(user.uid, paymentId, {
            productId,
            amount,
            paymentId,
            createdAt: new Date(),
          });

          if (user.email) {
            const product = await getProductById(productId);
            const productTitle = product?.title || 'Your Product';

            await sendOrderConfirmation({
              to: user.email,
              productTitle,
              amount,
              paymentId,
            });
          }
        }
      } catch (e) {
        console.error('Sipariş işlemlerinde hata oluştu:', e);
      }

      setStatus('done');
    };

    handleSuccess();
  }, [session_id, user]);

  if (status === 'loading') {
    return <p className="text-center mt-20 text-gray-500">Finalizing your order...</p>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white p-6 text-center shadow-lg sm:p-8 lg:p-10">
        <svg
          className="mx-auto h-24 w-24 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-transparent bg-slate-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
