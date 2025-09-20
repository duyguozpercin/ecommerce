'use client';

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CartBadge() {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center rounded-full p-2 hover:bg-neutral-200 transition"
      aria-label="Cart"
    >
      <Image
        src="/icons/cart.svg"
        alt="Cart Icon"
        width={20}
        height={20}
        priority
      />

      {mounted && totalItems > 0 && (
        <span
          data-testid="cart-count"
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}
