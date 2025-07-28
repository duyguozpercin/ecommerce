'use client';

import Link from "next/link";
import { useCart } from 'src/app/context/CartContext';
import { allCategories } from "@/types/product";

export default function Navbar() {
  const { totalItems } = useCart();
  const categories = allCategories;

  return (
    <header className="bg-[#f9f9f9] px-8 py-5 border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sol: Home */}
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
          <Link
            href="/"
            className="text-2xl font-bold text-[#171212] hover:text-black font-sans transition-colors tracking-wide"
          >
            Home
          </Link>
        </div>

        {/* Orta: Kategoriler */}
        <nav className="flex flex-wrap justify-center gap-6 text-lg font-semibold font-sans text-neutral-700">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="hover:text-neutral-900 transition-colors"
            >
              {category}
            </Link>
          ))}
        </nav>

        {/* Sağ: Cart & Admin */}
        <div className="flex items-center justify-center md:justify-end w-full md:w-auto gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center rounded-full p-2 hover:bg-neutral-200 transition"
            aria-label="Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#171212" viewBox="0 0 24 24">
              <path d="M7 4h-2l-3 9v2h2l3-9zm13.3 0h-10.3l-1.6 4h12.7c.6 0 1.1-.4 1.2-1l.8-3c.1-.6-.3-1.1-.8-1.1zM6 20c-1.1 0-1.99-.9-1.99-2s.89-2 1.99-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-1.99-.9-1.99-2s.89-2 1.99-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Admin */}
          <Link
            href="/admin/products/manage"
            className="flex items-center justify-center rounded-full p-2 hover:bg-neutral-200 transition"
            aria-label="Admin Panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#171212" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 5.7 1.3 6 4v2h-12v-2c.3-2.7 3.3-4 6-4zm0-2c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
