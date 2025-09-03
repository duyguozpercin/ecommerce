'use client';

import { checkout } from '@/app/actions/card/checkout';
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

  useEffect(() => {
    // Kullanıcı oturumunu dinle
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Kullanıcı giriş yapmadıysa butonu devre dışı bırak
  if (!userId) {
    return (
      <button
        disabled
        className={`bg-gray-400 text-white text-sm px-2 py-1 rounded cursor-not-allowed leading-normal ${className ?? ""}`}
      >
        Buy Now
      </button>
    );
  }

  // Kullanıcı giriş yaptıysa, checkout action'ını tetikleyecek formu göster
  return (
    <form action={checkout}>
  <input type="hidden" name="cartItems[0][id]" value={productId} />
  <input type="hidden" name="cartItems[0][quantity]" value="1" />
  <input type="hidden" name="userId" value={userId} />
  <button
    type="submit"
    className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ""}`}
  >
    Buy Now
  </button>
</form>
  );
};
