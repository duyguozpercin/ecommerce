'use client';

import { auth } from '@/utils/firebase';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

interface CartItem {
  id: string;
  quantity: number;
}

interface BuyButtonProps {
  productId?: string;
  cartItems?: CartItem[];
  className?: string;
}

export const BuyButton = ({ productId, cartItems, className }: BuyButtonProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const items: CartItem[] =
        cartItems && cartItems.length > 0
          ? cartItems
          : productId
          ? [{ id: productId, quantity: 1 }]
          : [];

      if (items.length === 0) {
        console.error("Checkout başlatılamadı: cartItems veya productId yok.");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId ?? 'guest',   // ✅ login yoksa guest olarak gönder
          cartItems: items 
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe yönlendirme URL’si alınamadı', data);
      }
    } catch (error) {
      console.error('Stripe yönlendirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      data-testid="buy-btn"
      onClick={handleCheckout}
      disabled={loading}
      className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ''}`}
    >
      {loading ? 'Redirecting…' : 'Buy Now'}
    </button>
  );
};
