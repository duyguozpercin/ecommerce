'use client';

import Link from "next/link";
import { allCategories } from "@/types/product";

export default function NavigationMenu() {
  const categories = allCategories;

  return (
    <nav className="hidden md:flex items-center gap-10 text-[13px] tracking-[0.18em] uppercase font-medium">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/products?category=${encodeURIComponent(category)}`}
          className="group relative pb-2 text-stone-700 transition hover:text-black"
        >
          {category}

          {/* Zara underline (soldan sağa) */}
          <span
            className="
              absolute left-0 bottom-0 h-[1px] w-full bg-black
              origin-left scale-x-0 transition-transform duration-300
              group-hover:scale-x-100
            "
          />
        </Link>
      ))}
    </nav>
  );
}
