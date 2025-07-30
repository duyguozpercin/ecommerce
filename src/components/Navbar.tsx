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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart3" viewBox="0 0 16 16">
  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
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
