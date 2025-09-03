'use client';

import { auth } from '@/utils/firebase';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

export const SingleBuyButton = ({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const handleCheckout = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const response = await fetch('/api/checkout-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cartItems: [{ id: productId, quantity: 1 }],
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe yönlendirme URL’si alınamadı');
      }
    } catch (error) {
      console.error('Stripe yönlendirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <button
        disabled
        className={`bg-gray-400 text-white text-sm px-2 py-1 rounded cursor-not-allowed leading-normal ${className ?? ''}`}
      >
        Buy Now
      </button>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ''}`}
    >
      {loading ? 'Redirecting…' : 'Buy Now'}
    </button>
  );
};
