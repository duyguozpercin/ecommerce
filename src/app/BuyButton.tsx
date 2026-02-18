"use client";

import { auth } from "@/utils/firebase";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

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
        console.error("Checkout could not be started: cartItems or productId is missing.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId ?? "guest",
          cartItems: items,
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe redirect URL could not be retrieved", data);
      }
    } catch (error) {
      console.error("Stripe redirect error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      data-testid="buy-btn"
      onClick={handleCheckout}
      disabled={loading}
      className={`
    inline-flex items-center justify-center gap-2
    h-11 w-full
    rounded-xl
    text-sm font-semibold
    border border-stone-200
    bg-white text-stone-900
    shadow-sm
    transition
    hover:bg-stone-50
    active:scale-[0.98]
    disabled:cursor-not-allowed disabled:opacity-70
    ${className ?? ""}
  `}
    >


      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900 dark:border-stone-600 dark:border-t-white" />
          Redirecting…
        </>
      ) : (
        "Buy Now"
      )}
    </button>
  );
};
