'use client';

import Link from "next/link";
import { allCategories } from "@/types/product";

interface MobileMenuProps {
  setMenuOpen: (open: boolean) => void;
}

export default function MobileMenu({ setMenuOpen }: MobileMenuProps) {
  const categories = allCategories;

  return (
    <div className="md:hidden mt-4 space-y-2">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/products?category=${encodeURIComponent(category)}`}
          onClick={() => setMenuOpen(false)}
          className="block px-4 py-2 bg-white rounded text-sm text-neutral-700 hover:bg-gray-100"
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
