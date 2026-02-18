'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { allCategories } from "@/types/product";

export default function NavigationMenu() {
  const categories = allCategories;
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <nav className="hidden md:flex items-center gap-10 text-[13px] tracking-[0.18em] uppercase font-medium">
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <Link
            key={category}
            href={`/products?category=${encodeURIComponent(category)}`}
            className="relative pb-2 text-stone-700 transition hover:text-black"
          >
            {category}

            {/* Underline */}
            <span
              className={`
                absolute left-0 bottom-0 h-[1px] w-full bg-black transition-all duration-300
                ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
              `}
            />
          </Link>
        );
      })}
    </nav>
  );
}
