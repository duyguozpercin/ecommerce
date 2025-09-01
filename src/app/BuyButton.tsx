'use client';

import { checkout } from '@/app/actions/card/checkout';
import { useAuth } from '@/app/context/AuthContext'; // 1. Auth context'ini import et

interface CartItemInput {
  id: string;
  quantity: number;
}

interface BuyButtonProps {
  cartItems: CartItemInput[];
  className?: string;
}

export const BuyButton = ({ cartItems, className }: BuyButtonProps) => {
  // 2. Giriş yapmış kullanıcıyı al
  const { user } = useAuth();

  if (!Array.isArray(cartItems)) {
    console.error("BuyButton: cartItems is undefined or not an array.");
    return null;
  }

  // Kullanıcı giriş yapmamışsa butonu devre dışı bırak
  if (!user) {
    return (
      <button
        type="button"
        disabled
        className={`bg-gray-400 text-white text-sm px-2 py-1 rounded cursor-not-allowed ${className ?? ""}`}
      >
        Buy Now (Please Log In)
      </button>
    );
  }

  return (
    <form action={checkout}>
      {/* Sepet ürünlerini gizli input olarak ekle */}
      {cartItems.map((item, index) => (
        <div key={index}>
          <input type="hidden" name={`cartItems[${index}][id]`} value={item.id} />
          <input
            type="hidden"
            name={`cartItems[${index}][quantity]`}
            value={item.quantity.toString()}
          />
        </div>
      ))}
      
      {/* 3. Kullanıcı ID'sini de forma gizli bir input olarak ekle */}
      <input type="hidden" name="userId" value={user.uid} />

      <button
        type="submit"
        className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ""}`}
      >
        Buy Now
      </button>
    </form>
  );
};
