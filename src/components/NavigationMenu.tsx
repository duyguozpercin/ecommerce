'use client';

import Link from "next/link";
import { allCategories } from "@/types/product";

export default function NavigationMenu() {
  const categories = allCategories;

  return (
    <nav className="hidden md:flex flex-wrap justify-center gap-6 text-lg font-semibold font-sans text-neutral-700">
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
  );
}
