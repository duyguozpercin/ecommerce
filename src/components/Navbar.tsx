'use client';

import Link from "next/link";
import { useCart } from 'src/app/context/CartContext';
import { useCategories } from 'src/app/context/CategoryContext'; // 🔥 ekledik

export default function Navbar() {
  const { totalItems } = useCart();
  const { categories, loading } = useCategories(); // 🔥 hook'u çağırdık

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#ffffff] bg-[#ffffff] px-10 py-4">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-[#171212] text-xl font-bold leading-normal">
          Home
        </Link>
        

        {/* 🔽 Kategoriler */}
        {!loading && categories.length > 0 && (
          <div className="flex gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="text-[#171212] text-xl font-bold leading-normal"
              >
                {category}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 justify-end gap-8">
        {/* 🔄 Sepet */}
        <Link
          href="/cart"
          className="relative flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 text-[#171212] gap-2 text-xl font-extrabold leading-normal tracking-[0.015em] min-w-0"
          aria-label="Cart"
        >
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M222.14,58.87..." />
            </svg>
          </div>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </Link>

        {/* 🔧 Admin */}
        <Link
          href="/admin/products/manage"
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 text-[#171212] gap-2 text-xl font-extrabold leading-normal tracking-[0.015em] min-w-0"
        >
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M128,24A104..." />
            </svg>
          </div>
        </Link>
      </div>
    </header>
  );
}
